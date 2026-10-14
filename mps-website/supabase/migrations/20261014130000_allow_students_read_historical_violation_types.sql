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
