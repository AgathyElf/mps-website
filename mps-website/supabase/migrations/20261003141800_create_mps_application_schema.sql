-- MPS application schema.
-- Access is intentionally closed by RLS until explicit authorization policies
-- are designed; service-role operations remain available to trusted servers.

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'student'
    CHECK (role IN ('student', 'admin', 'advisor', 'super_admin')),
  full_name text NOT NULL CHECK (length(btrim(full_name)) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS
  'Application profile associated with a Supabase Auth user.';

CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE REFERENCES public.profiles (id) ON DELETE SET NULL,
  student_number text NOT NULL UNIQUE
    CHECK (length(btrim(student_number)) > 0),
  full_name text NOT NULL CHECK (length(btrim(full_name)) > 0),
  class_name text CHECK (class_name IS NULL OR length(btrim(class_name)) > 0),
  generation text CHECK (generation IS NULL OR length(btrim(generation)) > 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.students IS
  'Student directory records; no student records are inserted by this migration.';

CREATE TABLE public.aspirations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students (id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) > 0),
  content text NOT NULL CHECK (length(btrim(content)) > 0),
  category text NOT NULL CHECK (length(btrim(category)) > 0),
  is_anonymous boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'in_review', 'responded', 'closed')),
  assigned_to_profile_id uuid
    REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.aspirations IS
  'Student-submitted aspirations and their current workflow status.';

CREATE TABLE public.aspiration_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aspiration_id uuid NOT NULL
    REFERENCES public.aspirations (id) ON DELETE RESTRICT,
  author_profile_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  status text CHECK (
    status IS NULL OR status IN ('submitted', 'in_review', 'responded', 'closed')
  ),
  content text CHECK (content IS NULL OR length(btrim(content)) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT aspiration_updates_has_change
    CHECK (status IS NOT NULL OR content IS NOT NULL)
);

COMMENT ON TABLE public.aspiration_updates IS
  'Chronological status and response history for an aspiration.';

CREATE TABLE public.violation_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE CHECK (length(btrim(name)) > 0),
  description text CHECK (
    description IS NULL OR length(btrim(description)) > 0
  ),
  points integer NOT NULL DEFAULT 0 CHECK (points >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.violation_types IS
  'Configurable violation categories and their point values.';

CREATE TABLE public.violation_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students (id) ON DELETE RESTRICT,
  violation_type_id uuid NOT NULL
    REFERENCES public.violation_types (id) ON DELETE RESTRICT,
  recorded_by_profile_id uuid
    REFERENCES public.profiles (id) ON DELETE SET NULL,
  occurred_at timestamptz NOT NULL,
  points_awarded integer NOT NULL CHECK (points_awarded >= 0),
  details text CHECK (details IS NULL OR length(btrim(details)) > 0),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.violation_records IS
  'Student violation records with a snapshot of the points awarded.';

CREATE TABLE public.point_resets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students (id) ON DELETE RESTRICT,
  reset_by_profile_id uuid
    REFERENCES public.profiles (id) ON DELETE SET NULL,
  points_removed integer NOT NULL CHECK (points_removed > 0),
  reason text NOT NULL CHECK (length(btrim(reason)) > 0),
  reset_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.point_resets IS
  'Auditable student point adjustments, including the amount removed and reason.';

CREATE INDEX students_profile_id_idx
  ON public.students (profile_id);

CREATE INDEX aspirations_student_created_at_idx
  ON public.aspirations (student_id, created_at DESC);
CREATE INDEX aspirations_status_created_at_idx
  ON public.aspirations (status, created_at DESC);
CREATE INDEX aspirations_assigned_to_profile_id_idx
  ON public.aspirations (assigned_to_profile_id);

CREATE INDEX aspiration_updates_aspiration_created_at_idx
  ON public.aspiration_updates (aspiration_id, created_at DESC);
CREATE INDEX aspiration_updates_author_profile_id_idx
  ON public.aspiration_updates (author_profile_id);

CREATE INDEX violation_records_student_occurred_at_idx
  ON public.violation_records (student_id, occurred_at DESC);
CREATE INDEX violation_records_violation_type_id_idx
  ON public.violation_records (violation_type_id);
CREATE INDEX violation_records_recorded_by_profile_id_idx
  ON public.violation_records (recorded_by_profile_id);
CREATE INDEX violation_records_status_occurred_at_idx
  ON public.violation_records (status, occurred_at DESC);

CREATE INDEX point_resets_student_reset_at_idx
  ON public.point_resets (student_id, reset_at DESC);
CREATE INDEX point_resets_reset_by_profile_id_idx
  ON public.point_resets (reset_by_profile_id);

CREATE FUNCTION public.set_mps_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_mps_updated_at();
CREATE TRIGGER students_set_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.set_mps_updated_at();
CREATE TRIGGER aspirations_set_updated_at
  BEFORE UPDATE ON public.aspirations
  FOR EACH ROW EXECUTE FUNCTION public.set_mps_updated_at();
CREATE TRIGGER aspiration_updates_set_updated_at
  BEFORE UPDATE ON public.aspiration_updates
  FOR EACH ROW EXECUTE FUNCTION public.set_mps_updated_at();
CREATE TRIGGER violation_types_set_updated_at
  BEFORE UPDATE ON public.violation_types
  FOR EACH ROW EXECUTE FUNCTION public.set_mps_updated_at();
CREATE TRIGGER violation_records_set_updated_at
  BEFORE UPDATE ON public.violation_records
  FOR EACH ROW EXECUTE FUNCTION public.set_mps_updated_at();
CREATE TRIGGER point_resets_set_updated_at
  BEFORE UPDATE ON public.point_resets
  FOR EACH ROW EXECUTE FUNCTION public.set_mps_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aspirations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aspiration_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_resets ENABLE ROW LEVEL SECURITY;
