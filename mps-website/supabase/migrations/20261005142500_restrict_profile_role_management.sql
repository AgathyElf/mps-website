DROP POLICY profiles_admin_all ON public.profiles;

CREATE POLICY profiles_admin_select
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    (SELECT private.current_mps_role()) IN ('admin', 'super_admin')
  );

CREATE POLICY profiles_super_admin_all
  ON public.profiles
  FOR ALL
  TO authenticated
  USING ((SELECT private.current_mps_role()) = 'super_admin')
  WITH CHECK ((SELECT private.current_mps_role()) = 'super_admin');
