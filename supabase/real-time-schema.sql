-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create tables for real-time data
CREATE TABLE IF NOT EXISTS props (
    id TEXT PRIMARY KEY,
    player_name TEXT NOT NULL,
    team TEXT NOT NULL,
    prop_type TEXT NOT NULL,
    line DECIMAL(10,2) NOT NULL,
    odds TEXT,
    confidence INTEGER DEFAULT 50,
    trend TEXT CHECK (trend IN ('up', 'down', 'neutral')),
    analysis TEXT,
    source TEXT DEFAULT 'PrizePicks',
    sport TEXT DEFAULT 'NBA',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS games (
    id TEXT PRIMARY KEY,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('live', 'scheduled', 'final')),
    quarter TEXT,
    time_remaining TEXT,
    home_odds TEXT,
    away_odds TEXT,
    start_time TEXT,
    game_date TEXT,
    sport TEXT DEFAULT 'NBA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS injuries (
    id TEXT PRIMARY KEY,
    player_name TEXT NOT NULL,
    team TEXT NOT NULL,
    status TEXT CHECK (status IN ('Out', 'Questionable', 'Doubtful', 'Probable')),
    injury_type TEXT,
    notes TEXT,
    sport TEXT DEFAULT 'NBA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    source TEXT,
    published_date TEXT,
    impact TEXT CHECK (impact IN ('positive', 'negative', 'neutral')),
    player_name TEXT,
    team_name TEXT,
    sport TEXT DEFAULT 'NBA',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    prop_id TEXT REFERENCES props(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_props_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    prop_id TEXT REFERENCES props(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_props_sport_active ON props(sport, is_active);
CREATE INDEX IF NOT EXISTS idx_props_confidence ON props(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_props_updated ON props(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_games_sport_status ON games(sport, status);
CREATE INDEX IF NOT EXISTS idx_games_updated ON games(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_injuries_sport ON injuries(sport);
CREATE INDEX IF NOT EXISTS idx_injuries_updated ON injuries(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_sport ON news(sport);
CREATE INDEX IF NOT EXISTS idx_news_created ON news(created_at DESC);

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE props;
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE injuries;
ALTER PUBLICATION supabase_realtime ADD TABLE news;

-- Row Level Security policies
ALTER TABLE props ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE injuries ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_props_lists ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users for public data
CREATE POLICY "Allow read access to props" ON props FOR SELECT USING (true);
CREATE POLICY "Allow read access to games" ON games FOR SELECT USING (true);
CREATE POLICY "Allow read access to injuries" ON injuries FOR SELECT USING (true);
CREATE POLICY "Allow read access to news" ON news FOR SELECT USING (true);

-- Allow authenticated users to manage their favorites
CREATE POLICY "Users can manage their favorites" ON user_favorites 
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their props lists" ON user_props_lists 
    FOR ALL USING (auth.uid() = user_id);

-- Insert some initial demo data
INSERT INTO props (id, player_name, team, prop_type, line, odds, confidence, trend, analysis) VALUES
('demo_1', 'LeBron James', 'LAL', 'Points', 25.5, 'Pick', 85, 'up', 'LeBron has exceeded this line in 7 of his last 10 games.'),
('demo_2', 'Stephen Curry', 'GSW', '3-Pointers', 4.5, 'Pick', 72, 'neutral', 'Curry averaging 4.8 threes per game at home this season.'),
('demo_3', 'Nikola Jokic', 'DEN', 'Rebounds', 12.5, 'Pick', 78, 'up', 'Jokic averaging 13.8 rebounds over his last 10 games.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO games (id, home_team, away_team, home_score, away_score, status, quarter, time_remaining) VALUES
('demo_game_1', 'LAL', 'DEN', 87, 82, 'live', '4th', '4:30'),
('demo_game_2', 'GSW', 'PHX', 64, 71, 'live', '3rd', '2:15')
ON CONFLICT (id) DO NOTHING;
