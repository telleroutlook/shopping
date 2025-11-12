-- Migration: add_orders_update_policy
-- Created at: 1762862432


-- 允许用户更新自己的订单
CREATE POLICY "Users can update own orders"
ON orders
FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
;