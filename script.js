// ===== Script Loading Check =====
console.log('🎯 script.js loaded from: /home/ubuntu/work/kosa-vibecoding-2026-3rd/src/exercise/sprits88-cloud/day03/kanban/');
console.log('📅 Last modified: 2026-06-18 14:02');

// ===== Global Variables =====
let cardIdCounter = 0;
let supabaseClient;  // Renamed to avoid conflict with global supabaseClient from SDK
let currentUser = null;
let currentBoardId = null; // Default board for the user

// ===== DOM Elements =====
const cardInput = document.getElementById('cardInput');
const addCardBtn = document.getElementById('addCardBtn');
const todoCards = document.getElementById('todo-cards');
const inProgressCards = document.getElementById('in-progress-cards');
const doneCards = document.getElementById('done-cards');
const userInfo = document.getElementById('user-info');
const userName = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

// ===== Card Creation =====
function createCard(content, cardId = null) {
    const card = document.createElement('div');
    card.className = 'card';
    card.draggable = true;

    // Use provided cardId (from DB) or generate new one
    if (cardId) {
        card.id = `card-${cardId}`;
        card.dataset.dbId = cardId;
    } else {
        card.id = `card-${cardIdCounter++}`;
    }

    card.innerHTML = `
        <button class="delete-btn" aria-label="카드 삭제">×</button>
        <div class="card-content">${escapeHtml(content)}</div>
    `;

    // Drag event listeners
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);

    // Delete button event listener
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteCard(card));

    return card;
}

// ===== Utility: Escape HTML to prevent XSS =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== Add Card =====
async function addCard() {
    const content = cardInput.value.trim();

    if (content === '') {
        alert('카드 내용을 입력해주세요!');
        cardInput.focus();
        return;
    }

    // If Supabase is configured, save to database
    if (supabaseClient && currentUser && currentBoardId) {
        try {
            // Get position (number of cards in todo column)
            const position = todoCards.querySelectorAll('.card').length;

            const { data, error } = await supabaseClient
                .from('cards')
                .insert({
                    board_id: currentBoardId,
                    title: content,
                    status: 'todo',
                    position: position,
                    created_by: currentUser.id
                })
                .select()
                .single();

            if (error) throw error;

            // Create card with DB id
            const card = createCard(content, data.id);
            todoCards.appendChild(card);
        } catch (error) {
            console.error('Error saving card:', error);
            alert('카드 저장 실패: ' + error.message);
            return;
        }
    } else {
        // Demo mode: create card without DB
        const card = createCard(content);
        todoCards.appendChild(card);
    }

    cardInput.value = '';
    cardInput.focus();
    updateCardCounts();
}

// ===== Delete Card =====
async function deleteCard(card) {
    if (!confirm('이 카드를 삭제하시겠습니까?')) {
        return;
    }

    // If Supabase is configured and card has DB id, delete from database
    if (supabaseClient && currentUser && card.dataset.dbId) {
        try {
            const { error } = await supabaseClient
                .from('cards')
                .delete()
                .eq('id', card.dataset.dbId);

            if (error) throw error;

            card.remove();
            updateCardCounts();
        } catch (error) {
            console.error('Error deleting card:', error);
            alert('카드 삭제 실패: ' + error.message);
        }
    } else {
        // Demo mode: just remove from DOM
        card.remove();
        updateCardCounts();
    }
}

// ===== Drag & Drop Event Handlers =====
function handleDragStart(e) {
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.id);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');

    // Remove all drag-over classes
    document.querySelectorAll('.cards-container').forEach(container => {
        container.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (this.classList.contains('cards-container')) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    // Only remove drag-over if leaving the container itself, not its children
    if (e.target === this) {
        this.classList.remove('drag-over');
    }
}

async function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    e.preventDefault();

    const cardId = e.dataTransfer.getData('text/html');
    const card = document.getElementById(cardId);

    if (card && this.classList.contains('cards-container')) {
        // Determine new status based on container
        let newStatus = 'todo';
        if (this === inProgressCards) {
            newStatus = 'in_progress';
        } else if (this === doneCards) {
            newStatus = 'done';
        }

        // Get new position
        const newPosition = this.querySelectorAll('.card').length;

        // If Supabase is configured and card has DB id, update database
        if (supabaseClient && currentUser && card.dataset.dbId) {
            try {
                const { error } = await supabaseClient
                    .from('cards')
                    .update({
                        status: newStatus,
                        position: newPosition
                    })
                    .eq('id', card.dataset.dbId);

                if (error) throw error;

                this.appendChild(card);
                this.classList.remove('drag-over');
                updateCardCounts();
            } catch (error) {
                console.error('Error updating card:', error);
                alert('카드 이동 실패: ' + error.message);
            }
        } else {
            // Demo mode: just move in DOM
            this.appendChild(card);
            this.classList.remove('drag-over');
            updateCardCounts();
        }
    }

    return false;
}

// ===== Update Card Counts =====
function updateCardCounts() {
    const columns = [
        { container: todoCards, countId: 'todo-count' },
        { container: inProgressCards, countId: 'in-progress-count' },
        { container: doneCards, countId: 'done-count' }
    ];

    columns.forEach(({ container, countId }) => {
        const count = container.querySelectorAll('.card').length;
        document.getElementById(countId).textContent = count;
    });
}

// ===== Event Listeners Setup =====
function setupEventListeners() {
    // Add card button click
    addCardBtn.addEventListener('click', addCard);

    // Enter key on input
    cardInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addCard();
        }
    });

    // Drag and drop for all containers
    const containers = [todoCards, inProgressCards, doneCards];
    containers.forEach(container => {
        container.addEventListener('dragover', handleDragOver);
        container.addEventListener('dragenter', handleDragEnter);
        container.addEventListener('dragleave', handleDragLeave);
        container.addEventListener('drop', handleDrop);
    });
}

// ===== Get or Create Default Board =====
async function getOrCreateDefaultBoard() {
    try {
        // Try to get existing board
        const { data: boards, error: fetchError } = await supabaseClient
            .from('boards')
            .select('*')
            .eq('user_id', currentUser.id)
            .is('deleted_at', null)
            .order('created_at', { ascending: true })
            .limit(1);

        if (fetchError) throw fetchError;

        if (boards && boards.length > 0) {
            return boards[0].id;
        }

        // Create default board if none exists
        const { data: newBoard, error: createError } = await supabaseClient
            .from('boards')
            .insert({
                user_id: currentUser.id,
                name: '나의 칸반보드',
                description: '기본 작업 보드'
            })
            .select()
            .single();

        if (createError) throw createError;

        return newBoard.id;
    } catch (error) {
        console.error('Error getting/creating board:', error);
        throw error;
    }
}

// ===== Load Cards from Database =====
async function loadCardsFromDB() {
    try {
        const { data: cards, error } = await supabaseClient
            .from('cards')
            .select('*')
            .eq('board_id', currentBoardId)
            .is('deleted_at', null)
            .order('position', { ascending: true });

        if (error) throw error;

        // Clear existing cards
        todoCards.innerHTML = '';
        inProgressCards.innerHTML = '';
        doneCards.innerHTML = '';

        // Render cards by status
        cards.forEach(cardData => {
            const card = createCard(cardData.title, cardData.id);

            switch (cardData.status) {
                case 'todo':
                    todoCards.appendChild(card);
                    break;
                case 'in_progress':
                    inProgressCards.appendChild(card);
                    break;
                case 'done':
                    doneCards.appendChild(card);
                    break;
            }
        });

        updateCardCounts();
    } catch (error) {
        console.error('Error loading cards:', error);
        alert('카드 로드 실패: ' + error.message);
    }
}

// ===== Initialize Sample Cards (Demo Mode) =====
function initializeSampleCards() {
    const sampleCards = [
        '프로젝트 기획서 작성',
        '디자인 시안 검토',
        '데이터베이스 설계'
    ];

    sampleCards.forEach(content => {
        const card = createCard(content);
        todoCards.appendChild(card);
    });

    updateCardCounts();
}

// ===== Supabase Initialization =====
function initializeSupabase() {
    try {
        console.log('🔧 Initializing Supabase...');

        if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
            console.error('❌ Supabase configuration is missing');
            return false;
        }

        if (SUPABASE_CONFIG.url === 'YOUR_SUPABASE_PROJECT_URL') {
            console.error('❌ Supabase URL not configured');
            return false;
        }

        if (!window.supabase) {
            console.error('❌ Supabase SDK not loaded');
            return false;
        }

        supabaseClient = window.supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey,
            {
                auth: {
                    persistSession: true,
                    storage: window.localStorage,
                    autoRefreshToken: true
                }
            }
        );

        console.log('✅ Supabase initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Supabase initialization error:', error);
        return false;
    }
}

// ===== Authentication Check =====
async function checkAuthentication() {
    try {
        console.log('🔐 Checking authentication...');

        const { data: { session }, error } = await supabaseClient.auth.getSession();

        if (error) {
            console.error('❌ Session check error:', error);
            throw error;
        }

        if (!session) {
            // No active session, redirect to login
            console.log('❌ No active session. Redirecting to auth.html...');
            window.location.href = 'auth.html';
            return false;
        }

        console.log('✅ User authenticated:', session.user.email);
        currentUser = session.user;
        displayUserInfo();
        return true;
    } catch (error) {
        console.error('❌ Authentication check error:', error);
        alert('인증 확인 실패. 로그인 페이지로 이동합니다.');
        window.location.href = 'auth.html';
        return false;
    }
}

// ===== Display User Info =====
function displayUserInfo() {
    if (currentUser) {
        const displayName = currentUser.user_metadata?.name || currentUser.email.split('@')[0];
        userName.textContent = displayName;
        userInfo.style.display = 'flex';
    }
}

// ===== Logout =====
async function handleLogout() {
    if (!supabaseClient) return;

    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;

        window.location.href = 'auth.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('로그아웃 실패: ' + error.message);
    }
}

// ===== Application Initialization =====
async function init() {
    console.log('🚀 Starting application initialization...');

    // Initialize Supabase
    const supabaseInitialized = initializeSupabase();

    if (!supabaseInitialized) {
        // Supabase not configured - redirect to auth page
        console.error('❌ Supabase not configured. Redirecting to auth page.');
        alert('애플리케이션 설정이 필요합니다. 로그인 페이지로 이동합니다.');
        window.location.href = 'auth.html';
        return;
    }

    // Check authentication (required)
    const isAuthenticated = await checkAuthentication();
    if (!isAuthenticated) {
        console.log('⏸️ Stopping initialization (not authenticated)');
        return; // Stop initialization if not authenticated (already redirected)
    }

    console.log('✅ Authentication successful. Loading user data...');

    // Setup logout button
    logoutBtn.addEventListener('click', handleLogout);

    try {
        // Get or create default board
        console.log('📋 Getting or creating default board...');
        currentBoardId = await getOrCreateDefaultBoard();
        console.log('✅ Board ID:', currentBoardId);

        // Load cards from database
        console.log('📥 Loading cards from database...');
        await loadCardsFromDB();
        console.log('✅ Cards loaded successfully');
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        alert('초기화 실패: ' + error.message);
    }

    setupEventListeners();

    // Focus on input for immediate use
    cardInput.focus();

    console.log('🎉 Application initialized successfully!');
}

// ===== Start Application =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
