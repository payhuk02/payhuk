import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || 'https://payhuk.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Allow-Credentials': 'true',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { method, url } = req
    const urlObj = new URL(url)
    const path = urlObj.pathname
    const segments = path.split('/').filter(Boolean)

    // Route: /api/payments/partial
    if (method === 'POST' && segments[2] === 'partial') {
      const { orderId, customerId, storeId, totalAmount, paymentPercentage, dueDate } = await req.json()

      // Validation
      if (!orderId || !customerId || !storeId || !totalAmount || !paymentPercentage) {
        return new Response(
          JSON.stringify({ error: 'Paramètres manquants' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (paymentPercentage < 1 || paymentPercentage > 99) {
        return new Response(
          JSON.stringify({ error: 'Pourcentage invalide (1-99%)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const paidAmount = (totalAmount * paymentPercentage) / 100
      const remainingAmount = totalAmount - paidAmount

      // Create partial payment
      const { data, error } = await supabaseClient
        .from('partial_payments')
        .insert({
          order_id: orderId,
          customer_id: customerId,
          store_id: storeId,
          total_amount: totalAmount,
          paid_amount: paidAmount,
          remaining_amount: remainingAmount,
          payment_percentage: paymentPercentage,
          payment_status: 'pending',
          due_date: dueDate || null
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating partial payment:', error)
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la création du paiement partiel' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, payment: data }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route: /api/payments/escrow
    if (method === 'POST' && segments[2] === 'escrow') {
      const { orderId, customerId, storeId, amount, releaseConditions } = await req.json()

      // Validation
      if (!orderId || !customerId || !storeId || !amount) {
        return new Response(
          JSON.stringify({ error: 'Paramètres manquants' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (amount <= 0) {
        return new Response(
          JSON.stringify({ error: 'Montant invalide' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const transactionId = `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Create escrow payment
      const { data, error } = await supabaseClient
        .from('escrow_payments')
        .insert({
          order_id: orderId,
          customer_id: customerId,
          store_id: storeId,
          amount: amount,
          escrow_status: 'held',
          transaction_id: transactionId,
          release_conditions: releaseConditions || null,
          paid_at: new Date().toISOString(),
          dispute_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating escrow payment:', error)
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la création du paiement escrow' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, payment: data }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route: /api/payments/escrow/:id/release
    if (method === 'PUT' && segments[2] === 'escrow' && segments[4] === 'release') {
      const escrowId = segments[3]
      const { notes } = await req.json()

      if (!escrowId) {
        return new Response(
          JSON.stringify({ error: 'ID du paiement escrow manquant' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Release escrow payment
      const { data, error } = await supabaseClient
        .from('escrow_payments')
        .update({
          escrow_status: 'released',
          released_at: new Date().toISOString()
        })
        .eq('id', escrowId)
        .select()
        .single()

      if (error) {
        console.error('Error releasing escrow payment:', error)
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la libération du paiement' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create payment history entry
      await supabaseClient
        .from('payment_history')
        .insert({
          order_id: data.order_id,
          payment_type: 'escrow',
          amount: data.amount,
          action: 'release',
          status: 'released',
          transaction_id: data.transaction_id,
          notes: notes || 'Paiement libéré par le client'
        })

      return new Response(
        JSON.stringify({ success: true, payment: data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route: /api/payments/escrow/:id/dispute
    if (method === 'POST' && segments[2] === 'escrow' && segments[4] === 'dispute') {
      const escrowId = segments[3]
      const { reason } = await req.json()

      if (!escrowId || !reason) {
        return new Response(
          JSON.stringify({ error: 'ID du paiement ou raison du litige manquant' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Open dispute
      const { data, error } = await supabaseClient
        .from('escrow_payments')
        .update({
          escrow_status: 'disputed'
        })
        .eq('id', escrowId)
        .select()
        .single()

      if (error) {
        console.error('Error opening dispute:', error)
        return new Response(
          JSON.stringify({ error: 'Erreur lors de l\'ouverture du litige' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create payment history entry
      await supabaseClient
        .from('payment_history')
        .insert({
          order_id: data.order_id,
          payment_type: 'escrow',
          amount: data.amount,
          action: 'dispute',
          status: 'disputed',
          transaction_id: data.transaction_id,
          notes: `Litige ouvert: ${reason}`
        })

      return new Response(
        JSON.stringify({ success: true, payment: data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route: /api/conversations
    if (method === 'POST' && segments[2] === 'conversations') {
      const { orderId, customerId, storeId, productId, conversationType } = await req.json()

      // Validation
      if (!orderId || !customerId || !storeId) {
        return new Response(
          JSON.stringify({ error: 'Paramètres manquants' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create conversation
      const { data, error } = await supabaseClient
        .from('conversations')
        .insert({
          order_id: orderId,
          customer_id: customerId,
          store_id: storeId,
          product_id: productId || null,
          conversation_type: conversationType || 'order'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating conversation:', error)
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la création de la conversation' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, conversation: data }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route: /api/messages
    if (method === 'POST' && segments[2] === 'messages') {
      const { conversationId, content, messageType, fileUrl, fileName, fileSize, fileType, replyToId } = await req.json()

      // Validation
      if (!conversationId || (!content && !fileUrl)) {
        return new Response(
          JSON.stringify({ error: 'Paramètres manquants' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Get user info
      const { data: { user } } = await supabaseClient.auth.getUser()
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Non authentifié' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Determine sender type
      let senderType = 'customer'
      const { data: store } = await supabaseClient
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (store) {
        senderType = 'store'
      }

      // Create message
      const { data, error } = await supabaseClient
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          sender_type: senderType,
          message_type: messageType || 'text',
          content: content || null,
          file_url: fileUrl || null,
          file_name: fileName || null,
          file_size: fileSize || null,
          file_type: fileType || null,
          reply_to_id: replyToId || null
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating message:', error)
        return new Response(
          JSON.stringify({ error: 'Erreur lors de l\'envoi du message' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: data }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route: /api/disputes
    if (method === 'POST' && segments[2] === 'disputes') {
      const { orderId, conversationId, escrowPaymentId, customerId, storeId, disputeType, subject, description, priority } = await req.json()

      // Validation
      if (!orderId || !conversationId || !customerId || !storeId || !subject || !description) {
        return new Response(
          JSON.stringify({ error: 'Paramètres manquants' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create dispute
      const { data, error } = await supabaseClient
        .from('disputes')
        .insert({
          order_id: orderId,
          conversation_id: conversationId,
          escrow_payment_id: escrowPaymentId || null,
          customer_id: customerId,
          store_id: storeId,
          dispute_type: disputeType || 'other',
          subject: subject,
          description: description,
          priority: priority || 'medium'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating dispute:', error)
        return new Response(
          JSON.stringify({ error: 'Erreur lors de la création du litige' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, dispute: data }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route not found
    return new Response(
      JSON.stringify({ error: 'Route non trouvée' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Unexpected error:', error)
    
    // Gestion spécifique des timeouts
    if (error instanceof Error && error.name === 'AbortError') {
      return new Response(
        JSON.stringify({ error: 'Timeout: La requête a pris trop de temps' }),
        { status: 408, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur interne du serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
