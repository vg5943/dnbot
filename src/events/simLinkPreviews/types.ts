export interface SimResult {
  v2: boolean;
  version: string;
  build_date: string;
  is_damage_mode: boolean;
  active_char: string;
  char_names: string[];
  damage_by_char: object[];
  damage_instances_by_char: object[];
  damage_by_char_by_targets: object[];
  char_active_time: object[];
  abil_usage_count_by_char: object[];
  particle_count: object;
  reactions_triggered: object;
  sim_duration: SimDuration;
  ele_uptime: object[];
  required_er: any;
  damage: Damage;
  dps: Dps;
  dps_by_target: object;
  damage_over_time: object;
  iter: number;
  runtime: number;
  num_targets: number;
  char_details: CharDetail[];
  target_details: TargetDetail[];
  config_file: string;
  text: string;
  debug: string;
}

export interface SimDuration {
  min: number;
  max: number;
  mean: number;
  sd: number;
}

export interface Damage {
  min: number;
  max: number;
  mean: number;
  sd: number;
}

export interface Dps {
  min: number;
  max: number;
  mean: number;
  sd: number;
}

export interface CharDetail {
  name: string;
  element: string;
  level: number;
  max_level: number;
  cons: number;
  weapon: Weapon;
  talents: Talents;
  sets: Sets;
  stats: number[];
  snapshot: number[];
}

export interface Weapon {
  name: string;
  refine: number;
  level: number;
  max_level: number;
}

export interface Talents {
  attack: number;
  skill: number;
  burst: number;
}

export interface Sets {
  [x: string]: number;
}

export interface TargetDetail {
  level: number;
}
