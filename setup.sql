-- ===== Kanban Board Database Setup =====
-- Run this in your Supabase SQL Editor
-- https://app.supabase.com/project/_/sql

-- ===== Create Tables =====

-- 1. Boards Table
CREATE TABLE IF NOT EXISTS public.boards (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 2. Cards Table
CREATE TABLE IF NOT EXISTS public.cards (
    id BIGSERIAL PRIMARY KEY,
    board_id BIGINT NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'todo',
    position INTEGER NOT NULL DEFAULT 0,
    priority VARCHAR(10) DEFAULT 'medium',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    CHECK (status IN ('todo', 'in_progress', 'done')),
    CHECK (priority IN ('low', 'medium', 'high'))
);

-- ===== Create Indexes =====
CREATE INDEX IF NOT EXISTS idx_boards_user_id ON public.boards(user_id);
CREATE INDEX IF NOT EXISTS idx_boards_deleted_at ON public.boards(deleted_at);
CREATE INDEX IF NOT EXISTS idx_cards_board_id ON public.cards(board_id);
CREATE INDEX IF NOT EXISTS idx_cards_status ON public.cards(status);
CREATE INDEX IF NOT EXISTS idx_cards_position ON public.cards(position);
CREATE INDEX IF NOT EXISTS idx_cards_deleted_at ON public.cards(deleted_at);

-- ===== Row Level Security (RLS) =====

-- Enable RLS
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Boards Policies
CREATE POLICY "Users can view their own boards"
ON public.boards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own boards"
ON public.boards FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boards"
ON public.boards FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boards"
ON public.boards FOR DELETE
USING (auth.uid() = user_id);

-- Cards Policies
CREATE POLICY "Users can view cards in their boards"
ON public.cards FOR SELECT
USING (
    board_id IN (
        SELECT id FROM public.boards WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can create cards in their boards"
ON public.cards FOR INSERT
WITH CHECK (
    board_id IN (
        SELECT id FROM public.boards WHERE user_id = auth.uid()
    )
    AND auth.uid() = created_by
);

CREATE POLICY "Users can update cards in their boards"
ON public.cards FOR UPDATE
USING (
    board_id IN (
        SELECT id FROM public.boards WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete cards in their boards"
ON public.cards FOR DELETE
USING (
    board_id IN (
        SELECT id FROM public.boards WHERE user_id = auth.uid()
    )
);

-- ===== Triggers for updated_at =====

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_boards_updated_at
BEFORE UPDATE ON public.boards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cards_updated_at
BEFORE UPDATE ON public.cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ===== Sample Data (Optional) =====
-- Uncomment to insert sample data after user registration

-- INSERT INTO public.boards (user_id, name, description) VALUES
-- ('YOUR_USER_ID', '나의 칸반보드', '기본 작업 보드');

-- INSERT INTO public.cards (board_id, title, status, position, created_by) VALUES
-- (1, '프로젝트 기획서 작성', 'todo', 0, 'YOUR_USER_ID'),
-- (1, '디자인 시안 검토', 'todo', 1, 'YOUR_USER_ID'),
-- (1, '데이터베이스 설계', 'in_progress', 0, 'YOUR_USER_ID');

-- ===== Verification Queries =====

-- Check if tables were created
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name IN ('boards', 'cards');

-- Check if RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables
-- WHERE schemaname = 'public' AND tablename IN ('boards', 'cards');

-- Check policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public' AND tablename IN ('boards', 'cards');
