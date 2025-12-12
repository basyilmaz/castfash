-- Make user super admin
UPDATE "User" 
SET "isSuperAdmin" = true 
WHERE email = 'basyilmaz@gmail.com';
