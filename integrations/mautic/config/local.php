<?php
$parameters = array(
    'db_driver' => 'pdo_mysql',
    'db_host' => 'mautic-db',
    'db_port' => 3306,
    'db_name' => 'mautic',
    'db_user' => 'mautic',
    'db_password' => 'mautic_secure_2025',
    'db_prefix' => null,
    
    'admin_email' => 'admin@superadmin.com',
    'admin_password' => 'Admin@Mautic2025',
    
    'mailer_transport' => 'smtp',
    'mailer_host' => 'smtp.gmail.com',
    'mailer_port' => 587,
    'mailer_user' => 'noreply@hypervisual.ch',
    'mailer_password' => 'your_app_password',
    'mailer_encryption' => 'tls',
    
    'site_url' => 'http://localhost:8084',
    'cache_path' => '%kernel.root_dir%/cache',
    'log_path' => '%kernel.root_dir%/logs',
    
    'api_enabled' => true,
    'api_enable_basic_auth' => true,
    
    'cors_restrict_domains' => false,
    'cors_valid_domains' => ['http://localhost:3000']
);