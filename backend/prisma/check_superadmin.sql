-- Check user isSuperAdmin status
SELECT id, email, "isSuperAdmin", "createdAt"
FROM "User" 
WHERE email = 'basyilmaz@gmail.com';
