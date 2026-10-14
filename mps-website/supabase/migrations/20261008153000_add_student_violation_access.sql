CREATE POLICY violation_types_select_active
  ON public.violation_types
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY point_resets_select_own
  ON public.point_resets
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
