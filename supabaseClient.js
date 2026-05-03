// supabaseClient.js - Módulo centralizado do Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ibukwhlxefiyqalrooam.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlidWt3aGx4ZWZpeXFhbHJvb2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2ODk1MDAsImV4cCI6MjA5MTI2NTUwMH0.8OZWvgn9GaNbzIT45frG1SGFPhsZk36vUVDdTgdbekw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
