const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

//query for postgresql
// const db = {
//   query: async (query, params) => {
//     const { data, error } = await supabase.from('user').select('*')
//     if (error) {
//       console.error(error)
//       return null
//     }
//     return data
//   }
// }
// print the data
// db.query().then(data => console.log(data))
module.exports = supabase;
