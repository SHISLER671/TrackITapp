import { NextRequest, NextResponse } from 'next/server'

interface WebhookPayload {
  event: 'sale' | 'refund' | 'inventory_update' | 'system_status'
  systemId: string
  systemType: 'revel' | 'square' | 'toast'
  timestamp: string
  data: {
    kegId?: string
    kegName?: string
    quantity?: number
    price?: number
    location?: string
    transactionId?: string
    [key: string]: any
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: WebhookPayload = await request.json()

    // Validate webhook payload
    if (!payload.event || !payload.systemId || !payload.systemType) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      )
    }

    // Process webhook based on event type
    switch (payload.event) {
      case 'sale':
        await handleSaleEvent(payload)
        break
      case 'refund':
        await handleRefundEvent(payload)
        break
      case 'inventory_update':
        await handleInventoryUpdate(payload)
        break
      case 'system_status':
        await handleSystemStatusUpdate(payload)
        break
      default:
        console.log('Unknown webhook event:', payload.event)
    }

    // Log webhook for audit trail
    await logWebhookEvent(payload)

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

async function handleSaleEvent(payload: WebhookPayload) {
  const { data } = payload
  
  if (!data.kegId || !data.quantity || !data.price) {
    throw new Error('Invalid sale data')
  }

  // Update keg inventory
  await updateKegInventory(data.kegId, -data.quantity)
  
  // Record sales transaction
  await recordSalesTransaction({
    kegId: data.kegId,
    kegName: data.kegName || 'Unknown',
    quantity: data.quantity,
    price: data.price,
    location: data.location || 'Unknown',
    posSystem: payload.systemType,
    transactionId: data.transactionId,
    timestamp: payload.timestamp
  })

  // Check for low inventory alerts
  await checkLowInventoryAlert(data.kegId)

  console.log('Sale processed:', {
    kegId: data.kegId,
    quantity: data.quantity,
    price: data.price
  })
}

async function handleRefundEvent(payload: WebhookPayload) {
  const { data } = payload
  
  if (!data.kegId || !data.quantity) {
    throw new Error('Invalid refund data')
  }

  // Reverse inventory update
  await updateKegInventory(data.kegId, data.quantity)
  
  // Record refund transaction
  await recordRefundTransaction({
    kegId: data.kegId,
    quantity: data.quantity,
    transactionId: data.transactionId,
    timestamp: payload.timestamp
  })

  console.log('Refund processed:', {
    kegId: data.kegId,
    quantity: data.quantity
  })
}

async function handleInventoryUpdate(payload: WebhookPayload) {
  const { data } = payload
  
  // Update inventory levels from POS system
  if (data.kegId && data.quantity !== undefined) {
    await syncInventoryLevels(data.kegId, data.quantity)
  }

  console.log('Inventory updated:', data)
}

async function handleSystemStatusUpdate(payload: WebhookPayload) {
  const { data } = payload
  
  // Update system status in database
  await updateSystemStatus(payload.systemId, {
    status: data.status || 'connected',
    lastHeartbeat: payload.timestamp,
    systemInfo: data.systemInfo || {}
  })

  console.log('System status updated:', {
    systemId: payload.systemId,
    status: data.status
  })
}

async function updateKegInventory(kegId: string, quantityChange: number) {
  // In a real implementation, this would update the database
  console.log(`Updating keg ${kegId} inventory by ${quantityChange}`)
  
  // Simulate database update
  // await supabase
  //   .from('kegs')
  //   .update({ 
  //     fill_level: Math.max(0, Math.min(100, currentFillLevel + quantityChange * 2))
  //   })
  //   .eq('id', kegId)
}

async function recordSalesTransaction(transaction: any) {
  // In a real implementation, this would record the transaction in the database
  console.log('Recording sales transaction:', transaction)
  
  // Simulate database insert
  // await supabase
  //   .from('sales_transactions')
  //   .insert({
  //     keg_id: transaction.kegId,
  //     keg_name: transaction.kegName,
  //     quantity: transaction.quantity,
  //     price: transaction.price,
  //     location: transaction.location,
  //     pos_system: transaction.posSystem,
  //     transaction_id: transaction.transactionId,
  //     timestamp: transaction.timestamp
  //   })
}

async function recordRefundTransaction(transaction: any) {
  // In a real implementation, this would record the refund in the database
  console.log('Recording refund transaction:', transaction)
}

async function checkLowInventoryAlert(kegId: string) {
  // In a real implementation, this would check current inventory levels
  // and trigger alerts if below threshold
  console.log(`Checking low inventory alert for keg ${kegId}`)
  
  // Simulate low inventory check
  // const keg = await supabase
  //   .from('kegs')
  //   .select('fill_level, name')
  //   .eq('id', kegId)
  //   .single()
  
  // if (keg.fill_level < 20) {
  //   await triggerLowInventoryAlert(keg)
  // }
}

async function syncInventoryLevels(kegId: string, quantity: number) {
  // In a real implementation, this would sync inventory levels from POS
  console.log(`Syncing inventory for keg ${kegId} to ${quantity}`)
}

async function updateSystemStatus(systemId: string, statusData: any) {
  // In a real implementation, this would update system status in the database
  console.log(`Updating system ${systemId} status:`, statusData)
}

async function logWebhookEvent(payload: WebhookPayload) {
  // In a real implementation, this would log webhook events for audit trail
  console.log('Webhook event logged:', {
    event: payload.event,
    systemId: payload.systemId,
    systemType: payload.systemType,
    timestamp: payload.timestamp
  })
  
  // Simulate database logging
  // await supabase
  //   .from('webhook_logs')
  //   .insert({
  //     event_type: payload.event,
  //     system_id: payload.systemId,
  //     system_type: payload.systemType,
  //     payload: payload.data,
  //     timestamp: payload.timestamp,
  //     processed: true
  //   })
}

// GET endpoint for webhook verification (some POS systems require this)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const challenge = searchParams.get('challenge')
  
  if (challenge) {
    // Echo back the challenge for webhook verification
    return NextResponse.json({ challenge })
  }
  
  return NextResponse.json({
    message: 'POS webhook endpoint active',
    timestamp: new Date().toISOString()
  })
}
