-- Add OPERATIONS_MANAGER role to app_role enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON t.typnamespace = n.oid
    WHERE t.typname = 'app_role' AND n.nspname = 'public'
  ) THEN
    RAISE EXCEPTION 'app_role enum does not exist';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'OPERATIONS_MANAGER'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'OPERATIONS_MANAGER';
  END IF;
END$$;

-- ---------- PROJECTS & OPERATIONS CORE (for project-scoped visibility) ----------

-- Project-related enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
    CREATE TYPE public.project_status AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_member_role') THEN
    CREATE TYPE public.project_member_role AS ENUM ('LEAD', 'TECHNICIAN', 'SUPPORT');
  END IF;
END$$;

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  client_name text NOT NULL,
  location text,
  status project_status NOT NULL DEFAULT 'PLANNING',
  start_date date,
  end_date date,
  created_by_admin_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Project members
CREATE TABLE IF NOT EXISTS public.project_members (
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role project_member_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

-- Project equipment requirements
CREATE TABLE IF NOT EXISTS public.project_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE RESTRICT,
  required_quantity integer NOT NULL CHECK (required_quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Project documents (metadata only; files in storage)
CREATE TABLE IF NOT EXISTS public.project_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  uploaded_by_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT
);

-- Enable RLS on project tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- RLS for projects: admins & operations manager manage all, members read
DO $$
BEGIN
  -- Projects
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'projects' AND policyname = 'Projects admin/ops full access'
  ) THEN
    CREATE POLICY "Projects admin/ops full access" ON public.projects
      FOR ALL
      USING (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER'))
      WITH CHECK (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'projects' AND policyname = 'Project members can view projects'
  ) THEN
    CREATE POLICY "Project members can view projects" ON public.projects
      FOR SELECT
      USING (
        public.has_role(auth.uid(), 'ADMIN')
        OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER')
        OR EXISTS (
          SELECT 1 FROM public.project_members pm
          WHERE pm.project_id = projects.id AND pm.user_id = auth.uid()
        )
      );
  END IF;

  -- Project members
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'project_members' AND policyname = 'Project members admin/ops manage'
  ) THEN
    CREATE POLICY "Project members admin/ops manage" ON public.project_members
      FOR ALL
      USING (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER'))
      WITH CHECK (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'project_members' AND policyname = 'Project members can view membership'
  ) THEN
    CREATE POLICY "Project members can view membership" ON public.project_members
      FOR SELECT
      USING (
        public.has_role(auth.uid(), 'ADMIN')
        OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER')
        OR user_id = auth.uid()
      );
  END IF;

  -- Project requirements
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'project_requirements' AND policyname = 'Project requirements admin/ops manage'
  ) THEN
    CREATE POLICY "Project requirements admin/ops manage" ON public.project_requirements
      FOR ALL
      USING (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER'))
      WITH CHECK (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'project_requirements' AND policyname = 'Project members can view requirements'
  ) THEN
    CREATE POLICY "Project members can view requirements" ON public.project_requirements
      FOR SELECT
      USING (
        public.has_role(auth.uid(), 'ADMIN')
        OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER')
        OR EXISTS (
          SELECT 1 FROM public.project_members pm
          WHERE pm.project_id = project_requirements.project_id AND pm.user_id = auth.uid()
        )
      );
  END IF;

  -- Project documents
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'project_documents' AND policyname = 'Project documents admin/ops manage'
  ) THEN
    CREATE POLICY "Project documents admin/ops manage" ON public.project_documents
      FOR ALL
      USING (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER'))
      WITH CHECK (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'project_documents' AND policyname = 'Project members can view documents'
  ) THEN
    CREATE POLICY "Project members can view documents" ON public.project_documents
      FOR SELECT
      USING (
        public.has_role(auth.uid(), 'ADMIN')
        OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER')
        OR EXISTS (
          SELECT 1 FROM public.project_members pm
          WHERE pm.project_id = project_documents.project_id AND pm.user_id = auth.uid()
        )
      );
  END IF;
END$$;

-- Triggers for updated_at on projects and requirements
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_projects_updated_at'
  ) THEN
    CREATE TRIGGER trg_projects_updated_at
      BEFORE UPDATE ON public.projects
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_project_requirements_updated_at'
  ) THEN
    CREATE TRIGGER trg_project_requirements_updated_at
      BEFORE UPDATE ON public.project_requirements
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- ---------- FINANCE & CONTRACTS ----------

-- Finance-related enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'supplier_service_type') THEN
    CREATE TYPE public.supplier_service_type AS ENUM ('EQUIPMENT', 'MAINTENANCE', 'WASTE_DISPOSAL', 'CONSULTING');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'supplier_status') THEN
    CREATE TYPE public.supplier_status AS ENUM ('ACTIVE', 'INACTIVE');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contract_status') THEN
    CREATE TYPE public.contract_status AS ENUM ('ACTIVE', 'EXPIRED', 'TERMINATED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
    CREATE TYPE public.invoice_status AS ENUM ('PENDING', 'PAID', 'OVERDUE');
  END IF;
END$$;

-- Suppliers
CREATE TABLE IF NOT EXISTS public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  service_type supplier_service_type NOT NULL,
  contact_info text,
  certifications text,
  status supplier_status NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Contracts
CREATE TABLE IF NOT EXISTS public.contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  value numeric(14,2) NOT NULL CHECK (value >= 0),
  currency text NOT NULL,
  status contract_status NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL,
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  category text NOT NULL,
  amount numeric(14,2) NOT NULL CHECK (amount >= 0),
  currency text NOT NULL,
  incurred_at date NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
  contract_id uuid NOT NULL REFERENCES public.contracts(id) ON DELETE RESTRICT,
  amount numeric(14,2) NOT NULL CHECK (amount >= 0),
  currency text NOT NULL,
  due_date date NOT NULL,
  status invoice_status NOT NULL DEFAULT 'PENDING',
  document_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on finance tables
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS: ADMIN & OPERATIONS_MANAGER manage all; project-scoped visibility for others
DO $$
BEGIN
  -- Suppliers: only admin/ops can see & manage
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'suppliers' AND policyname = 'Suppliers admin/ops full access'
  ) THEN
    CREATE POLICY "Suppliers admin/ops full access" ON public.suppliers
      FOR ALL
      USING (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER'))
      WITH CHECK (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER'));
  END IF;

  -- Contracts
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'contracts' AND policyname = 'Contracts admin/ops manage'
  ) THEN
    CREATE POLICY "Contracts admin/ops manage" ON public.contracts
      FOR ALL
      USING (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER'))
      WITH CHECK (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'contracts' AND policyname = 'Contracts project scoped read'
  ) THEN
    CREATE POLICY "Contracts project scoped read" ON public.contracts
      FOR SELECT
      USING (
        public.has_role(auth.uid(), 'ADMIN')
        OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER')
        OR (
          project_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = contracts.project_id AND pm.user_id = auth.uid()
          )
        )
      );
  END IF;

  -- Expenses
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'expenses' AND policyname = 'Expenses admin/ops manage'
  ) THEN
    CREATE POLICY "Expenses admin/ops manage" ON public.expenses
      FOR ALL
      USING (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER'))
      WITH CHECK (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'expenses' AND policyname = 'Expenses project scoped read'
  ) THEN
    CREATE POLICY "Expenses project scoped read" ON public.expenses
      FOR SELECT
      USING (
        public.has_role(auth.uid(), 'ADMIN')
        OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER')
        OR (
          project_id IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM public.project_members pm
            WHERE pm.project_id = expenses.project_id AND pm.user_id = auth.uid()
          )
        )
      );
  END IF;

  -- Invoices
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'invoices' AND policyname = 'Invoices admin/ops manage'
  ) THEN
    CREATE POLICY "Invoices admin/ops manage" ON public.invoices
      FOR ALL
      USING (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER'))
      WITH CHECK (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'invoices' AND policyname = 'Invoices project scoped read'
  ) THEN
    CREATE POLICY "Invoices project scoped read" ON public.invoices
      FOR SELECT
      USING (
        public.has_role(auth.uid(), 'ADMIN')
        OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER')
        OR EXISTS (
          SELECT 1
          FROM public.contracts c
          JOIN public.project_members pm ON pm.project_id = c.project_id
          WHERE c.id = invoices.contract_id AND pm.user_id = auth.uid()
        )
      );
  END IF;
END$$;

-- Triggers for updated_at on finance tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_suppliers_updated_at'
  ) THEN
    CREATE TRIGGER trg_suppliers_updated_at
      BEFORE UPDATE ON public.suppliers
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_contracts_updated_at'
  ) THEN
    CREATE TRIGGER trg_contracts_updated_at
      BEFORE UPDATE ON public.contracts
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- ---------- STORAGE FOR FINANCE DOCUMENTS ----------

-- Single private bucket for finance documents (contracts & invoices)
INSERT INTO storage.buckets (id, name, public)
VALUES ('finance-documents', 'finance-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Basic RLS for storage.objects: admin/ops can manage finance-documents, project members can read via signed URLs later
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Finance documents admin/ops full access'
  ) THEN
    CREATE POLICY "Finance documents admin/ops full access" ON storage.objects
      FOR ALL
      USING (
        bucket_id = 'finance-documents'
        AND (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER'))
      )
      WITH CHECK (
        bucket_id = 'finance-documents'
        AND (public.has_role(auth.uid(), 'ADMIN') OR public.has_role(auth.uid(), 'OPERATIONS_MANAGER'))
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Finance documents authenticated read'
  ) THEN
    CREATE POLICY "Finance documents authenticated read" ON storage.objects
      FOR SELECT
      USING (
        bucket_id = 'finance-documents' AND auth.role() = 'authenticated'
      );
  END IF;
END$$;