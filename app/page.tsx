export default function Home() {
  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#2563eb' }}>
        🍺 Keg Tracker
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#64748b', textAlign: 'center', maxWidth: '600px' }}>
        Track beer kegs across the supply chain from brewery to restaurant
      </p>
      
      <div style={{ 
        marginTop: '2rem', 
        padding: '2rem', 
        border: '2px solid #e2e8f0', 
        borderRadius: '8px',
        backgroundColor: '#f8fafc'
      }}>
        <h2 style={{ color: '#1e293b', marginBottom: '1rem' }}>Features Coming Soon:</h2>
        <ul style={{ color: '#475569', lineHeight: '1.6' }}>
          <li>✅ QR Code scanning</li>
          <li>✅ Delivery tracking</li>
          <li>✅ Inventory management</li>
          <li>✅ Real-time updates</li>
          <li>✅ Mobile-first design</li>
        </ul>
      </div>

      <div style={{ 
        marginTop: '2rem', 
        fontSize: '0.9rem', 
        color: '#64748b',
        textAlign: 'center'
      }}>
        <p>🚀 Successfully deployed to Vercel!</p>
        <p>Built with Next.js 15 and React 19</p>
      </div>
    </main>
  )
}
