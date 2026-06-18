// ===== Supabase Client Initialization =====
let supabaseClient;

function initializeSupabase() {
    try {
        if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
            throw new Error('Supabase configuration is missing. Please update config.js');
        }

        if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_PROJECT_URL') {
            console.error('Please configure your Supabase credentials in config.js');
            showMessage('error', 'Supabase가 설정되지 않았습니다. config.js 파일을 확인해주세요.');
            return false;
        }

        supabaseClient = window.supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey,
            {
                auth: {
                    persistSession: true,
                    storage: window.localStorage,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            }
        );

        return true;
    } catch (error) {
        console.error('Supabase initialization error:', error);
        showMessage('error', 'Supabase 초기화 실패: ' + error.message);
        return false;
    }
}

// ===== DOM Elements =====
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const loadingOverlay = document.getElementById('loading-overlay');

// OAuth buttons
const googleLoginBtn = document.getElementById('google-login-btn');
const githubLoginBtn = document.getElementById('github-login-btn');
const googleSignupBtn = document.getElementById('google-signup-btn');
const githubSignupBtn = document.getElementById('github-signup-btn');

// ===== Tab Switching =====
function setupTabSwitching() {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update active tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${targetTab}-tab`) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// ===== Loading State =====
function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

// ===== Message Display =====
function showMessage(type, text) {
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const message = document.createElement('div');
    message.className = `message message-${type}`;
    message.innerHTML = `
        <span class="material-icons">${type === 'success' ? 'check_circle' : 'error'}</span>
        <span>${text}</span>
    `;

    const authCard = document.querySelector('.auth-card');
    const activeTab = document.querySelector('.tab-content.active');
    activeTab.insertBefore(message, activeTab.firstChild);

    setTimeout(() => {
        message.remove();
    }, 5000);
}

// ===== Email/Password Login =====
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showMessage('error', '이메일과 비밀번호를 입력해주세요.');
        return;
    }

    try {
        showLoading();

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        if (data.user) {
            // Check if email is verified
            if (!data.user.email_confirmed_at) {
                showMessage('error', '이메일 인증이 필요합니다. 이메일을 확인해주세요.');
                await supabaseClient.auth.signOut();
                hideLoading();
                return;
            }

            showMessage('success', '로그인 성공! 리디렉션 중...');
            setTimeout(() => {
                window.location.href = APP_CONFIG.redirectTo;
            }, 1000);
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('error', '로그인 실패: ' + error.message);
    } finally {
        hideLoading();
    }
}

// ===== Email/Password Signup =====
async function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-password-confirm').value;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showMessage('error', '모든 필드를 입력해주세요.');
        return;
    }

    if (password.length < 6) {
        showMessage('error', '비밀번호는 최소 6자 이상이어야 합니다.');
        return;
    }

    if (password !== confirmPassword) {
        showMessage('error', '비밀번호가 일치하지 않습니다.');
        return;
    }

    try {
        showLoading();

        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                },
                emailRedirectTo: APP_CONFIG.emailRedirectTo
            }
        });

        if (error) throw error;

        if (data.user) {
            showMessage('success', '회원가입 성공! 이메일을 확인하여 인증을 완료해주세요.');

            // Clear form
            signupForm.reset();

            // Switch to login tab after 3 seconds
            setTimeout(() => {
                const loginTab = document.querySelector('[data-tab="login"]');
                loginTab.click();
            }, 3000);
        }
    } catch (error) {
        console.error('Signup error:', error);
        if (error.message.includes('already registered')) {
            showMessage('error', '이미 등록된 이메일입니다.');
        } else {
            showMessage('error', '회원가입 실패: ' + error.message);
        }
    } finally {
        hideLoading();
    }
}

// ===== OAuth Login (Google, GitHub) =====
async function handleOAuthLogin(provider) {
    try {
        showLoading();

        const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: APP_CONFIG.redirectTo,
                scopes: OAUTH_PROVIDERS[provider].scopes
            }
        });

        if (error) throw error;

        // OAuth will redirect to provider's login page
        // User will be redirected back to redirectTo URL after authentication
    } catch (error) {
        console.error(`${provider} OAuth error:`, error);
        showMessage('error', `${provider} 로그인 실패: ` + error.message);
        hideLoading();
    }
}

// ===== Check for OAuth Redirect =====
async function checkOAuthRedirect() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();

        if (error) throw error;

        if (session) {
            // User is authenticated via OAuth
            showMessage('success', '로그인 성공! 리디렉션 중...');
            setTimeout(() => {
                window.location.href = APP_CONFIG.redirectTo;
            }, 1000);
        }
    } catch (error) {
        console.error('OAuth redirect check error:', error);
    }
}

// ===== Check Email Verification Link =====
async function checkEmailVerification() {
    try {
        // Check if URL contains email confirmation token
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (accessToken && type === 'signup') {
            showLoading();

            // Get current session
            const { data: { session }, error } = await supabaseClient.auth.getSession();

            if (error) throw error;

            if (session) {
                showMessage('success', '이메일 인증 완료! 로그인 페이지로 이동합니다.');

                // Clear hash from URL
                window.history.replaceState(null, '', window.location.pathname);

                setTimeout(() => {
                    // Switch to login tab
                    const loginTab = document.querySelector('[data-tab="login"]');
                    loginTab.click();
                }, 2000);
            }

            hideLoading();
        }
    } catch (error) {
        console.error('Email verification error:', error);
        showMessage('error', '이메일 인증 실패: ' + error.message);
        hideLoading();
    }
}

// ===== Event Listeners Setup =====
function setupEventListeners() {
    // Form submissions
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // OAuth buttons - Login
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', () => handleOAuthLogin('google'));
    }

    if (githubLoginBtn) {
        githubLoginBtn.addEventListener('click', () => handleOAuthLogin('github'));
    }

    // OAuth buttons - Signup (same handler as login for OAuth)
    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', () => handleOAuthLogin('google'));
    }

    if (githubSignupBtn) {
        githubSignupBtn.addEventListener('click', () => handleOAuthLogin('github'));
    }

    // Tab switching
    setupTabSwitching();
}

// ===== Check if User is Already Logged In =====
async function checkExistingSession() {
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();

        if (error) throw error;

        if (session) {
            // User is already logged in, redirect to main app
            window.location.href = APP_CONFIG.redirectTo;
        }
    } catch (error) {
        console.error('Session check error:', error);
    }
}

// ===== Initialize Application =====
async function init() {
    // Initialize Supabase
    const initialized = initializeSupabase();
    if (!initialized) {
        return;
    }

    // Setup event listeners
    setupEventListeners();

    // Check for existing session
    await checkExistingSession();

    // Check for OAuth redirect
    await checkOAuthRedirect();

    // Check for email verification link
    await checkEmailVerification();

    // Hide loading initially
    hideLoading();
}

// ===== Start Application =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
