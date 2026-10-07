export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          mobile: string | null;
          education: string | null;
          state: string | null;
          district: string | null;
          target_role: string | null;
          github_handle: string | null;
          avatar_url: string | null;
          passport_visibility: 'public' | 'private' | 'unlisted';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          mobile?: string | null;
          education?: string | null;
          state?: string | null;
          district?: string | null;
          target_role?: string | null;
          github_handle?: string | null;
          avatar_url?: string | null;
          passport_visibility?: 'public' | 'private' | 'unlisted';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          mobile?: string | null;
          education?: string | null;
          state?: string | null;
          district?: string | null;
          target_role?: string | null;
          github_handle?: string | null;
          avatar_url?: string | null;
          passport_visibility?: 'public' | 'private' | 'unlisted';
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          category: string | null;
          level: string | null;
          price: number;
          status: 'active' | 'coming-soon';
          thumbnail_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          slug: string;
          title: string;
          description?: string | null;
          category?: string | null;
          level?: string | null;
          price?: number;
          status?: 'active' | 'coming-soon';
          thumbnail_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          price?: number;
          status?: 'active' | 'coming-soon';
          updated_at?: string;
        };
      };
      course_modules: {
        Row: {
          id: string;
          course_id: string;
          module_number: string;
          title: string;
          description: string | null;
          sort_order: number;
        };
        Insert: {
          id: string;
          course_id: string;
          module_number: string;
          title: string;
          description?: string | null;
          sort_order: number;
        };
        Update: {
          module_number?: string;
          title?: string;
          description?: string | null;
          sort_order?: number;
        };
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          description: string | null;
          content_type: 'video' | 'reading' | 'quiz' | 'lab';
          video_url: string | null;
          duration_minutes: number;
          sort_order: number;
          is_published: boolean;
        };
        Insert: {
          id: string;
          module_id: string;
          title: string;
          description?: string | null;
          content_type: 'video' | 'reading' | 'quiz' | 'lab';
          video_url?: string | null;
          duration_minutes?: number;
          sort_order: number;
          is_published?: boolean;
        };
        Update: {
          title?: string;
          description?: string | null;
          content_type?: 'video' | 'reading' | 'quiz' | 'lab';
          video_url?: string | null;
          duration_minutes?: number;
          is_published?: boolean;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          status: 'active' | 'completed' | 'cancelled';
          progress_percent: number;
          enrolled_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          status?: 'active' | 'completed' | 'cancelled';
          progress_percent?: number;
          enrolled_at?: string;
          completed_at?: string | null;
        };
        Update: {
          status?: 'active' | 'completed' | 'cancelled';
          progress_percent?: number;
          completed_at?: string | null;
        };
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          status: 'not_started' | 'in_progress' | 'completed';
          progress_percent: number;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          status?: 'not_started' | 'in_progress' | 'completed';
          progress_percent?: number;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          status?: 'not_started' | 'in_progress' | 'completed';
          progress_percent?: number;
          completed_at?: string | null;
        };
      };
      skills: {
        Row: {
          id: string;
          name: string;
          category: 'Frontend' | 'Backend' | 'Database' | 'Engineering' | 'Security';
          description: string | null;
        };
        Insert: {
          id: string;
          name: string;
          category: 'Frontend' | 'Backend' | 'Database' | 'Engineering' | 'Security';
          description?: string | null;
        };
        Update: {
          name?: string;
          category?: 'Frontend' | 'Backend' | 'Database' | 'Engineering' | 'Security';
          description?: string | null;
        };
      };
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string;
          skill_id: string;
          difficulty: 'Easy' | 'Medium' | 'Hard';
          language: string;
          starter_code: string;
          test_definition: Json;
          time_limit_minutes: number;
          status: 'active' | 'archived';
          created_at: string;
        };
        Insert: {
          id: string;
          title: string;
          description: string;
          skill_id: string;
          difficulty: 'Easy' | 'Medium' | 'Hard';
          language?: string;
          starter_code: string;
          test_definition?: Json;
          time_limit_minutes?: number;
          status?: 'active' | 'archived';
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          starter_code?: string;
        };
      };
      challenge_submissions: {
        Row: {
          id: string;
          user_id: string;
          challenge_id: string;
          code: string;
          language: string;
          status: 'submitted' | 'passed' | 'failed' | 'evaluated';
          score: number;
          tests_passed: number;
          tests_total: number;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_id: string;
          code: string;
          language?: string;
          status?: 'submitted' | 'passed' | 'failed' | 'evaluated';
          score?: number;
          tests_passed?: number;
          tests_total?: number;
          submitted_at?: string;
        };
        Update: {
          status?: 'submitted' | 'passed' | 'failed' | 'evaluated';
          score?: number;
          tests_passed?: number;
        };
      };
      projects: {
        Row: {
          id: string;
          title: string;
          description: string;
          difficulty: string | null;
          course_id: string | null;
          status: 'active' | 'archived';
          created_at: string;
        };
        Insert: {
          id: string;
          title: string;
          description: string;
          difficulty?: string | null;
          course_id?: string | null;
          status?: 'active' | 'archived';
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
        };
      };
      project_submissions: {
        Row: {
          id: string;
          user_id: string;
          project_id: string;
          repository_url: string;
          deployment_url: string | null;
          status: 'submitted' | 'in-progress' | 'reviewed' | 'passed';
          score: number;
          submitted_at: string;
          evaluated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id: string;
          repository_url: string;
          deployment_url?: string | null;
          status?: 'submitted' | 'in-progress' | 'reviewed' | 'passed';
          score?: number;
          submitted_at?: string;
          evaluated_at?: string | null;
        };
        Update: {
          repository_url?: string;
          deployment_url?: string | null;
          status?: 'submitted' | 'in-progress' | 'reviewed' | 'passed';
          score?: number;
          evaluated_at?: string | null;
        };
      };
      project_evidence: {
        Row: {
          id: string;
          project_submission_id: string;
          requirements_score: number;
          architecture_score: number;
          testing_score: number;
          code_quality_score: number;
          security_score: number;
          evidence_score: number;
          overall_score: number;
          evaluation_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_submission_id: string;
          requirements_score?: number;
          architecture_score?: number;
          testing_score?: number;
          code_quality_score?: number;
          security_score?: number;
          evidence_score?: number;
          overall_score?: number;
          evaluation_notes?: string | null;
          created_at?: string;
        };
        Update: {
          overall_score?: number;
          evaluation_notes?: string | null;
        };
      };
      assessments: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          course_id: string | null;
          skill_id: string | null;
          assessment_type: 'practice' | 'theory' | 'coding';
          duration_minutes: number;
          status: 'active' | 'draft';
        };
        Insert: {
          id: string;
          title: string;
          description?: string | null;
          course_id?: string | null;
          skill_id?: string | null;
          assessment_type: 'practice' | 'theory' | 'coding';
          duration_minutes?: number;
          status?: 'active' | 'draft';
        };
        Update: {
          title?: string;
          description?: string | null;
        };
      };
      assessment_attempts: {
        Row: {
          id: string;
          user_id: string;
          assessment_id: string;
          score: number;
          status: 'passed' | 'in-progress' | 'failed';
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          assessment_id: string;
          score: number;
          status?: 'passed' | 'in-progress' | 'failed';
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          score?: number;
          status?: 'passed' | 'in-progress' | 'failed';
          completed_at?: string | null;
        };
      };
      evidence: {
        Row: {
          id: string;
          user_id: string;
          skill_id: string;
          source_type: 'lesson' | 'challenge' | 'assessment' | 'project' | 'viva';
          source_id: string;
          score: number;
          metadata: Json;
          verification_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          skill_id: string;
          source_type: 'lesson' | 'challenge' | 'assessment' | 'project' | 'viva';
          source_id: string;
          score: number;
          metadata?: Json;
          verification_hash: string;
          created_at?: string;
        };
        Update: {
          score?: number;
          metadata?: Json;
        };
      };
      skill_scores: {
        Row: {
          id: string;
          user_id: string;
          skill_id: string;
          score: number;
          confidence: 'LOW' | 'MEDIUM' | 'HIGH';
          evidence_count: number;
          last_updated: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          skill_id: string;
          score: number;
          confidence?: 'LOW' | 'MEDIUM' | 'HIGH';
          evidence_count?: number;
          last_updated?: string;
        };
        Update: {
          score?: number;
          confidence?: 'LOW' | 'MEDIUM' | 'HIGH';
          evidence_count?: number;
          last_updated?: string;
        };
      };
      skill_passports: {
        Row: {
          id: string;
          user_id: string;
          overall_score: number;
          grade: string;
          passport_status: 'active' | 'building' | 'suspended';
          verification_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          overall_score?: number;
          grade?: string;
          passport_status?: 'active' | 'building' | 'suspended';
          verification_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          overall_score?: number;
          grade?: string;
          passport_status?: 'active' | 'building' | 'suspended';
          updated_at?: string;
        };
      };
      credentials: {
        Row: {
          id: string;
          user_id: string;
          credential_type: 'course_completion' | 'platform_assessment' | 'skill_passport';
          title: string;
          status: 'active' | 'pending' | 'expired';
          issued_at: string;
          verification_id: string;
          metadata: Json;
        };
        Insert: {
          id: string;
          user_id: string;
          credential_type: 'course_completion' | 'platform_assessment' | 'skill_passport';
          title: string;
          status?: 'active' | 'pending' | 'expired';
          issued_at?: string;
          verification_id: string;
          metadata?: Json;
        };
        Update: {
          title?: string;
          status?: 'active' | 'pending' | 'expired';
          metadata?: Json;
        };
      };
    };
  };
}
