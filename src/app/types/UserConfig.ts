export interface UserConfig {
  username: string;
  hostname: string;
  case_dirs: string[];
  cesm_env_script: string;
  cesm_path: string;
  user_scripts?: string[];
}
