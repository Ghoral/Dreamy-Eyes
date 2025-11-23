CREATE OR REPLACE FUNCTION public.get_sales(
  limit_value int DEFAULT 10,
  offset_value int DEFAULT 0
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  total_count integer;
BEGIN
  -- Count total sales
  SELECT count(*) INTO total_count FROM public.sales;

  -- Fetch paginated sales
  SELECT coalesce(
    json_agg(row_to_json(s) ORDER BY s.created_at DESC),
    '[]'::json
  )
  INTO result
  FROM (
    SELECT *
    FROM public.sales
    ORDER BY created_at DESC
    LIMIT limit_value
    OFFSET offset_value
  ) s;

  -- Return combined JSON object
  RETURN json_build_object(
    'data', result,
    'total', total_count
  );
END;
$$;

