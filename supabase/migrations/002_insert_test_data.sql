-- 插入商品数据
INSERT INTO products (name, description, price, category_id, brand, stock, rating, review_count, main_image, is_active) VALUES
('iPhone 15 Pro Max', '苹果最新旗舰手机，采用钛金属材质，搭载A17 Pro芯片', 8999.00, 1, 'Apple', 50, 4.8, 256, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', true),
('MacBook Pro 16英寸', '全新M3 Max芯片，16英寸Liquid Retina XDR显示屏', 22999.00, 1, 'Apple', 20, 4.9, 128, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400', true),
('AirPods Pro 3', '全新AirPods Pro 3代，支持主动降噪、空间音频', 1899.00, 1, 'Apple', 100, 4.7, 432, 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400', true),
('海尔洗衣机', '10公斤变频滚筒洗衣机，蒸汽洗护，节能静音', 2899.00, 2, '海尔', 30, 4.6, 89, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', true),
('美的冰箱', '520升变频风冷无霜冰箱，三门设计，智能温控', 3999.00, 2, '美的', 25, 4.5, 67, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400', true),
('Nike运动鞋', 'Nike Air Zoom系列跑步鞋，舒适透气，缓震性能优异', 899.00, 3, 'Nike', 80, 4.4, 156, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', true),
('Adidas外套', 'Adidas经典运动外套，防风防雨，透气排汗', 599.00, 3, 'Adidas', 60, 4.3, 234, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', true),
('兰蔻面霜', '兰蔻小黑瓶面霜，抗衰老成分，深度滋养肌肤', 680.00, 4, '兰蔻', 40, 4.6, 187, 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400', true),
('SK-II神仙水', 'SK-II经典神仙水，深层补水保湿，改善肌肤质感', 1590.00, 4, 'SK-II', 35, 4.7, 298, 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400', true),
('茅台酒', '贵州茅台53度酱香型白酒，传统工艺，醇厚口感', 2699.00, 5, '茅台', 15, 4.8, 45, 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400', true),
('瑞士手表', '瑞士进口机械手表，经典设计，自动上链，精准走时', 5599.00, 3, '瑞士进口', 10, 4.9, 23, 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400', true),
('小米电视', '55英寸4K超清智能电视，支持HDR10+，内置小爱同学', 2299.00, 2, '小米', 45, 4.4, 167, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400', true)
ON CONFLICT DO NOTHING;