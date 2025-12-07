CREATE OR REPLACE FUNCTION public.get_enabled_offers()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  total_count integer;
BEGIN
  -- Count enabled offers
  SELECT count(*) INTO total_count
  FROM public.offers
  WHERE is_enabled = true;

  -- Fetch enabled offers
  SELECT coalesce(
    json_agg(row_to_json(o) ORDER BY o.id),
    '[]'::json
  )
  INTO result
  FROM (
    SELECT *
    FROM public.offers
    WHERE is_enabled = true
    ORDER BY id
  ) o;

  -- Return JSON response
  RETURN json_build_object(
    'data', result,
    'total', total_count
  );
END;
$$;







