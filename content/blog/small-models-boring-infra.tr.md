+++
title = "Küçük modeller, sıkıcı altyapı: bütçeyle LLM servisi"
description = "Şirket içi LLM iş yüklerinin çoğu neden tek GPU'ya sığar: kuantizasyon, önbellek ve batching. Ve ne zaman sığmaz."
date = 2026-07-14

[taxonomies]
tags = ["LLM", "MLOps", "Inference"]

[extra]
kind = "post"
+++

## Varsayılan sandığınızdan ucuz

Şirket içi LLM iş yüklerinin çoğu — sınıflandırma, bilgi çıkarma, şirket verisi üzerinde özetleme — hiçbir zaman en büyük API modellerine ihtiyaç duymadı. 8 hatta 4 bite kuantize edilmiş, sürekli batching ile servis edilen 7–14B'lik bir model, tek bir GPU'da dakikada yüzlerce isteği karşılar.

Sıkıcı çözüm kazanır: tek bir inference sunucusu, tekrar eden önekler için prompt önbelleği ve otomatik ölçeklendirme kahramanlıkları yerine geri basınçlı bir kuyruk.

## Ne zaman yetmez

Ölçek öngörülebilir yerlerden kırılır. Uzun bağlamlar, throughput sorun olmadan çok önce KV-cache belleğini tüketir. Katı gecikme hedefleri olan dalgalı trafik ya fazla kapasite ya da zarif bozulma gerektirir — daha kısa maksimum token, daha küçük taslak modeller, önbelleğe alınmış yedekler.

> p99 gecikme grafiğiniz kalp atışı gibi görünüyorsa model sorununuz yok demektir. Batching sorununuz var.

## Yapmaya değer maliyet hesabı

Token başına değil, tamamlanan bin görev başına maliyeti takip edin. İyi kurulmuş bir değerlendirme döngüsü ve yeniden deneme politikası olan küçük bir model, dolar başına görev başarısında büyük modeli rutin olarak yener. Önce görevi ölçün, sonra modeli doğru boyutlandırın.
