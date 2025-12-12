-- Fix Turkish Characters in prompt_presets descriptions
-- Run this to correct encoding issues

UPDATE prompt_presets 
SET description = 'Klasik studyo cekimi - notr arka plan, profesyonel aydinlatma'
WHERE name = 'Studio Classic';

UPDATE prompt_presets 
SET description = 'Yaz plaj cekimi - gunesli, tropik atmosfer'
WHERE name = 'Beach Summer';

UPDATE prompt_presets 
SET description = 'Sehir sokak cekimi - modern, dinamik'
WHERE name = 'Urban Street';

UPDATE prompt_presets 
SET description = 'Luks ic mekan cekimi - elegans ve sofistike'
WHERE name = 'Luxury Indoor';

UPDATE prompt_presets 
SET description = 'E-ticaret beyaz fon - urun odakli, sade'
WHERE name = 'E-commerce White';
