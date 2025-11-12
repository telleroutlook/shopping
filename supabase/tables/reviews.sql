CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    order_item_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    user_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    price_rating INTEGER CHECK (price_rating >= 1 AND price_rating <= 5),
    logistics_rating INTEGER CHECK (logistics_rating >= 1 AND logistics_rating <= 5),
    content TEXT,
    images TEXT[],
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);