-- Function to get all user activity logs with camelCase property names
CREATE OR REPLACE FUNCTION public.get_user_activity_logs()
 RETURNS TABLE(
    id bigint,
    action text,
    tableName text,
    module text,
    createdAt timestamp with time zone,
    userName text,
    email text,
    role text
 ) 
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.action,
    al.table_name as "tableName",
    al.module,
    al.created_at as "createdAt",
    p.first_name || ' ' || p.last_name as "userName",
    p.email,
    p.role
  FROM 
    activity_logs al
  JOIN 
    profiles p ON al.user_id = p.id
  ORDER BY 
    al.created_at DESC;
END;
$function$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_activity_logs() TO authenticated;