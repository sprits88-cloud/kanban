// ===== Supabase Configuration =====
// IMPORTANT: Replace these with your actual Supabase project credentials
// You can find these values in your Supabase project settings:
// https://app.supabase.com/project/_/settings/api

const SUPABASE_CONFIG = {
    // Your Supabase project URL
    // Example: 'https://abcdefghijklmnop.supabase.co'
    url: 'https://tmnchzyvehzctzlethcw.supabase.co',

    // Your Supabase anon/public key
    // Example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtbmNoenl2ZWh6Y3R6bGV0aGN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MjAyMTksImV4cCI6MjA5NzI5NjIxOX0.Y2Tcv8eU4fRtE30Odovo77IZRJlgJ_-SyPBROr-grN0'
};

// OAuth Provider Configuration
const OAUTH_PROVIDERS = {
    google: {
        enabled: true,
        scopes: 'email profile'
    },
    github: {
        enabled: true,
        scopes: 'user:email'
    }
};

// App Configuration
const APP_CONFIG = {
    // Redirect URL after successful authentication
    redirectTo: window.location.origin + '/index.html',

    // Email confirmation settings
    emailRedirectTo: window.location.origin + '/auth.html',

    // Session settings
    sessionPersistence: 'local', // 'local' or 'session'
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SUPABASE_CONFIG, OAUTH_PROVIDERS, APP_CONFIG };
}
