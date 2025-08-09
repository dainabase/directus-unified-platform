const axios = require('axios');
const cheerio = require('cheerio');

async function completeInstallation() {
  console.log('🚀 Finalisation de l\'installation Mautic...');
  
  try {
    // Étape 1 : Environment Check
    console.log('1️⃣ Vérification de l\'environnement...');
    const step0 = await axios.get('http://localhost:8084/installer');
    const $0 = cheerio.load(step0.data);
    const token0 = $0('input[name="install_check_step[_token]"]').val();
    
    const step0Response = await axios.post('http://localhost:8084/installer/step/0', {
      'install_check_step[site_url]': 'http://localhost:8084',
      'install_check_step[cache_path]': '%kernel.project_dir%/var/cache',
      'install_check_step[log_path]': '%kernel.project_dir%/var/logs',
      'install_check_step[_token]': token0,
      'install_check_step[buttons][next]': ''
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    // Étape 2 : Database Setup
    console.log('2️⃣ Configuration de la base de données...');
    const $1 = cheerio.load(step0Response.data);
    const token1 = $1('input[name="install_database_step[_token]"]').val();
    
    const step1Response = await axios.post('http://localhost:8084/installer/step/1', {
      'install_database_step[driver]': 'pdo_mysql',
      'install_database_step[host]': 'mautic-db',
      'install_database_step[port]': '3306',
      'install_database_step[name]': 'mautic',
      'install_database_step[user]': 'mautic',
      'install_database_step[password]': 'mautic_secure_2025',
      'install_database_step[table_prefix]': '',
      'install_database_step[_token]': token1,
      'install_database_step[buttons][next]': ''
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    // Étape 3 : User Setup
    console.log('3️⃣ Création de l\'utilisateur admin...');
    const $2 = cheerio.load(step1Response.data);
    const token2 = $2('input[name="install_user_step[_token]"]').val();
    
    const step2Response = await axios.post('http://localhost:8084/installer/step/2', {
      'install_user_step[firstname]': 'Super',
      'install_user_step[lastname]': 'Admin',
      'install_user_step[username]': 'admin',
      'install_user_step[email]': 'admin@superadmin.com',
      'install_user_step[password]': 'Admin@Mautic2025',
      'install_user_step[_token]': token2,
      'install_user_step[buttons][next]': ''
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    // Étape 4 : Email Configuration
    console.log('4️⃣ Configuration email...');
    const $3 = cheerio.load(step2Response.data);
    const token3 = $3('input[name="install_email_step[_token]"]').val();
    
    const step3Response = await axios.post('http://localhost:8084/installer/step/3', {
      'install_email_step[mailer_transport]': 'smtp',
      'install_email_step[mailer_host]': 'localhost',
      'install_email_step[mailer_port]': '25',
      'install_email_step[mailer_user]': '',
      'install_email_step[mailer_password]': '',
      'install_email_step[mailer_encryption]': '',
      'install_email_step[mailer_auth_mode]': '',
      'install_email_step[_token]': token3,
      'install_email_step[buttons][next]': ''
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    console.log('✅ Installation Mautic terminée !');
    console.log('🔗 URL : http://localhost:8084');
    console.log('👤 Login : admin');
    console.log('🔑 Password : Admin@Mautic2025');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'installation :', error.message);
    if (error.response) {
      console.error('Status :', error.response.status);
      console.error('Response :', error.response.data.substring(0, 500));
    }
  }
}

completeInstallation();