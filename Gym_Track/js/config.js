// js/config.js
// ===== Global Variables & Supabase Setup =====
const SUPABASE_URL = 'https://yvjoabpmyorsvofdajpv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_clE9pyURcbzjd2ryHuLGzg_eVVItVuc';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let workouts = [];
