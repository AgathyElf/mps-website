DROP POLICY IF EXISTS violation_types_admin_all
  ON public.violation_types;
DROP POLICY IF EXISTS violation_types_select_active
  ON public.violation_types;
DROP POLICY IF EXISTS violation_types_select_own_history
  ON public.violation_types;
DROP POLICY IF EXISTS violation_types_admin_select
  ON public.violation_types;
DROP POLICY IF EXISTS violation_types_admin_insert
  ON public.violation_types;
DROP POLICY IF EXISTS violation_types_admin_update
  ON public.violation_types;

CREATE POLICY violation_types_select_active
  ON public.violation_types
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY violation_types_select_own_history
  ON public.violation_types
  FOR SELECT
  TO authenticated
  USING (
    (SELECT private.current_mps_role()) = 'student'
    AND EXISTS (
      SELECT 1
      FROM public.violation_records AS violation
      JOIN public.students AS student
        ON student.id = violation.student_id
      WHERE violation.violation_type_id = violation_types.id
        AND student.profile_id = (SELECT auth.uid())
    )
  );

CREATE POLICY violation_types_admin_select
  ON public.violation_types
  FOR SELECT
  TO authenticated
  USING ((SELECT private.is_mps_admin()));

CREATE POLICY violation_types_admin_insert
  ON public.violation_types
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT private.is_mps_admin()));

CREATE POLICY violation_types_admin_update
  ON public.violation_types
  FOR UPDATE
  TO authenticated
  USING ((SELECT private.is_mps_admin()))
  WITH CHECK ((SELECT private.is_mps_admin()));

DROP POLICY IF EXISTS violation_records_admin_all
  ON public.violation_records;
DROP POLICY IF EXISTS violation_records_admin_select
  ON public.violation_records;
DROP POLICY IF EXISTS violation_records_admin_update_status
  ON public.violation_records;

CREATE POLICY violation_records_admin_select
  ON public.violation_records
  FOR SELECT
  TO authenticated
  USING ((SELECT private.is_mps_admin()));

CREATE POLICY violation_records_admin_update_status
  ON public.violation_records
  FOR UPDATE
  TO authenticated
  USING ((SELECT private.is_mps_admin()))
  WITH CHECK ((SELECT private.is_mps_admin()));

DROP POLICY IF EXISTS point_resets_admin_all
  ON public.point_resets;
DROP POLICY IF EXISTS point_resets_admin_select
  ON public.point_resets;

CREATE POLICY point_resets_admin_select
  ON public.point_resets
  FOR SELECT
  TO authenticated
  USING ((SELECT private.is_mps_admin()));

REVOKE ALL PRIVILEGES ON TABLE
  public.violation_types,
  public.violation_records,
  public.point_resets
  FROM PUBLIC, anon, authenticated;

REVOKE SELECT (id, name, description, points, is_active, created_at, updated_at),
  INSERT (id, name, description, points, is_active, created_at, updated_at),
  UPDATE (id, name, description, points, is_active, created_at, updated_at),
  REFERENCES (id, name, description, points, is_active, created_at, updated_at)
  ON TABLE public.violation_types
  FROM PUBLIC, anon, authenticated;

REVOKE SELECT (
    id, student_id, violation_type_id, recorded_by_profile_id, occurred_at,
    points_awarded, details, status, created_at, updated_at
  ),
  INSERT (
    id, student_id, violation_type_id, recorded_by_profile_id, occurred_at,
    points_awarded, details, status, created_at, updated_at
  ),
  UPDATE (
    id, student_id, violation_type_id, recorded_by_profile_id, occurred_at,
    points_awarded, details, status, created_at, updated_at
  ),
  REFERENCES (
    id, student_id, violation_type_id, recorded_by_profile_id, occurred_at,
    points_awarded, details, status, created_at, updated_at
  )
  ON TABLE public.violation_records
  FROM PUBLIC, anon, authenticated;

REVOKE SELECT (
    id, student_id, reset_by_profile_id, points_removed, reason, reset_at,
    created_at, updated_at
  ),
  INSERT (
    id, student_id, reset_by_profile_id, points_removed, reason, reset_at,
    created_at, updated_at
  ),
  UPDATE (
    id, student_id, reset_by_profile_id, points_removed, reason, reset_at,
    created_at, updated_at
  ),
  REFERENCES (
    id, student_id, reset_by_profile_id, points_removed, reason, reset_at,
    created_at, updated_at
  )
  ON TABLE public.point_resets
  FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE
  public.violation_types,
  public.violation_records,
  public.point_resets
  TO authenticated;

GRANT INSERT (name, description, points, is_active),
  UPDATE (name, description, points, is_active)
  ON TABLE public.violation_types
  TO authenticated;

GRANT UPDATE (status)
  ON TABLE public.violation_records
  TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_create_violation_record(
  p_student_id uuid,
  p_violation_type_id uuid,
  p_occurred_at timestamptz,
  p_details text,
  p_status text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_points integer;
  v_record_id uuid;
BEGIN
  IF COALESCE(
    private.current_mps_role() IN ('admin', 'super_admin'),
    false
  ) IS NOT TRUE THEN
    RAISE EXCEPTION 'Administrator access required.'
      USING ERRCODE = '42501';
  END IF;

  IF p_student_id IS NULL
    OR p_violation_type_id IS NULL
    OR p_occurred_at IS NULL
    OR p_status IS NULL
    OR p_status NOT IN ('pending', 'confirmed', 'dismissed')
  THEN
    RAISE EXCEPTION 'Invalid violation record input.'
      USING ERRCODE = '22023';
  END IF;

  SELECT violation_type.points
    INTO v_points
    FROM public.violation_types AS violation_type
    WHERE violation_type.id = p_violation_type_id
      AND violation_type.is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active violation type not found.'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.violation_records (
    student_id,
    violation_type_id,
    recorded_by_profile_id,
    occurred_at,
    points_awarded,
    details,
    status
  )
  VALUES (
    p_student_id,
    p_violation_type_id,
    (SELECT auth.uid()),
    p_occurred_at,
    v_points,
    NULLIF(btrim(p_details), ''),
    p_status
  )
  RETURNING id INTO v_record_id;

  RETURN v_record_id;
END;
$$;

ALTER FUNCTION public.admin_create_violation_record(
  uuid, uuid, timestamptz, text, text
) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.admin_create_violation_record(
  uuid, uuid, timestamptz, text, text
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_violation_record(
  uuid, uuid, timestamptz, text, text
) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_create_point_reset(
  p_student_id uuid,
  p_points_removed integer,
  p_reason text,
  p_reset_at timestamptz
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_reset_id uuid;
BEGIN
  IF COALESCE(
    private.current_mps_role() IN ('admin', 'super_admin'),
    false
  ) IS NOT TRUE THEN
    RAISE EXCEPTION 'Administrator access required.'
      USING ERRCODE = '42501';
  END IF;

  IF p_student_id IS NULL
    OR p_points_removed IS NULL
    OR p_points_removed <= 0
    OR p_reason IS NULL
    OR length(btrim(p_reason)) = 0
    OR p_reset_at IS NULL
  THEN
    RAISE EXCEPTION 'Invalid point reset input.'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.point_resets (
    student_id,
    reset_by_profile_id,
    points_removed,
    reason,
    reset_at
  )
  VALUES (
    p_student_id,
    (SELECT auth.uid()),
    p_points_removed,
    btrim(p_reason),
    p_reset_at
  )
  RETURNING id INTO v_reset_id;

  RETURN v_reset_id;
END;
$$;

ALTER FUNCTION public.admin_create_point_reset(
  uuid, integer, text, timestamptz
) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.admin_create_point_reset(
  uuid, integer, text, timestamptz
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_point_reset(
  uuid, integer, text, timestamptz
) TO authenticated;
