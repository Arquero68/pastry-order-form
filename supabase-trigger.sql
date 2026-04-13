-- Database trigger to send email when order status changes to 'confirmed'
-- This runs automatically when the status is updated

CREATE OR REPLACE FUNCTION send_confirmation_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger on status change to 'confirmed' and if email exists
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' AND NEW.customer_email IS NOT NULL AND NEW.customer_email != '' THEN
    -- Call the edge function asynchronously
    PERFORM 
      supabase_http.request(
        'http://localhost:54321/functions/v1/send-order-confirmation',
        'POST',
        jsonb_build_object(
          'order_id', NEW.id,
          'status', NEW.status
        )::text,
        'application/json',
        (SELECT jsonb_build_object(
          'Authorization', 'Bearer ' || (SELECT jwt FROM auth.session LIMIT 1),
          'Content-Type', 'application/json'
        ))
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_send_confirmation_email ON orders;
CREATE TRIGGER trigger_send_confirmation_email
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_confirmation_on_status_change();
