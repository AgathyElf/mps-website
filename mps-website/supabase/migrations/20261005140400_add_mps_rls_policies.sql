-- Keep role lookups outside profiles RLS evaluation to avoid policy recursion.
CREATE SCHEMA private AUTHORIZATION postgres;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE FUNCTION private.current_mps_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT profile.role
  FROM public.profiles AS profile
  WHERE profile.id = (SELECT auth.uid());
$$;

ALTER FUNCTION private.current_mps_role() OWNER TO postgres;
REVOKE ALL ON FUNCTION private.current_mps_role() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.current_mps_role() TO authenticated;

CREATE FUNCTION private.is_mps_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT private.current_mps_role() IN ('admin', 'super_admin')),
    false
  );
$$;

ALTER FUNCTION private.is_mps_admin() OWNER TO postgres;
REVOKE ALL ON FUNCTION private.is_mps_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.is_mps_admin() TO authenticated;

-- RLS does not apply to TRUNCATE; remove non-application table privileges too.
REVOKE TRUNCATE, REFERENCES, TRIGGER
  ON TABLE
    public.profiles,
    public.students,
    public.aspirations,
    public.aspiration_updates,
    public.violation_types,
    public.violation_records,
    public.point_resets
  FROM anon, authenticated;

CREATE POLICY profiles_select_own_student
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    id = (SELECT auth.uid())
    AND (SELECT private.current_mps_role()) = 'student'
  );

CREATE POLICY profiles_admin_all
  ON public.profiles
  FOR ALL
  TO authenticated
  USING ((SELECT private.is_mps_admin()))
  WITH CHECK ((SELECT private.is_mps_admin()));

CREATE POLICY students_select_own
  ON public.students
  FOR SELECT
  TO authenticated
  USING (
    profile_id = (SELECT auth.uid())
    AND (SELECT private.current_mps_role()) = 'student'
  );

CREATE POLICY students_admin_all
  ON public.students
  FOR ALL
  TO authenticated
  USING ((SELECT private.is_mps_admin()))
  WITH CHECK ((SELECT private.is_mps_admin()));

CREATE POLICY aspirations_select_own
  ON public.aspirations
  FOR SELECT
  TO authenticated
  USING (
    (SELECT private.current_mps_role()) = 'student'
    AND student_id IN (
      SELECT student.id
      FROM public.students AS student
      WHERE student.profile_id = (SELECT auth.uid())
    )
  );

CREATE POLICY aspirations_insert_own_submitted
  ON public.aspirations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT private.current_mps_role()) = 'student'
    AND status = 'submitted'
    AND assigned_to_profile_id IS NULL
    AND student_id IN (
      SELECT student.id
      FROM public.students AS student
      WHERE student.profile_id = (SELECT auth.uid())
    )
  );

CREATE POLICY aspirations_admin_all
  ON public.aspirations
  FOR ALL
  TO authenticated
  USING ((SELECT private.is_mps_admin()))
  WITH CHECK ((SELECT private.is_mps_admin()));

CREATE POLICY aspiration_updates_select_own
  ON public.aspiration_updates
  FOR SELECT
  TO authenticated
  USING (
    (SELECT private.current_mps_role()) = 'student'
    AND EXISTS (
      SELECT 1
      FROM public.aspirations AS aspiration
      JOIN public.students AS student
        ON student.id = aspiration.student_id
      WHERE aspiration.id = aspiration_updates.aspiration_id
        AND student.profile_id = (SELECT auth.uid())
    )
  );

CREATE POLICY aspiration_updates_admin_all
  ON public.aspiration_updates
  FOR ALL
  TO authenticated
  USING ((SELECT private.is_mps_admin()))
  WITH CHECK ((SELECT private.is_mps_admin()));

CREATE POLICY violation_types_admin_all
  ON public.violation_types
  FOR ALL
  TO authenticated
  USING ((SELECT private.is_mps_admin()))
  WITH CHECK ((SELECT private.is_mps_admin()));

CREATE POLICY violation_records_select_own
  ON public.violation_records
  FOR SELECT
  TO authenticated
  USING (
    (SELECT private.current_mps_role()) = 'student'
    AND student_id IN (
      SELECT student.id
      FROM public.students AS student
      WHERE student.profile_id = (SELECT auth.uid())
    )
  );

CREATE POLICY violation_records_admin_all
  ON public.violation_records
  FOR ALL
  TO authenticated
  USING ((SELECT private.is_mps_admin()))
  WITH CHECK ((SELECT private.is_mps_admin()));

CREATE POLICY point_resets_admin_all
  ON public.point_resets
  FOR ALL
  TO authenticated
  USING ((SELECT private.is_mps_admin()))
  WITH CHECK ((SELECT private.is_mps_admin()));
