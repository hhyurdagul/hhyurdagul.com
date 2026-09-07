+++
title = "Üretimde hayatta kalan ML projeleri planlamak"
description = "Danışmanlık notları: hayata geçen ML projelerini tıkananlardan ayıran keşif soruları ve pilot yapısı."
date = 2026-05-30

[taxonomies]
tags = ["Danışmanlık", "MLOps", "Görüş"]

[extra]
kind = "post"
+++

## Veri setinden değil, karardan başlayın

Her kapsam belirleme görüşmesi aynı soruyla açılmalı: *Bu model hangi kararı değiştirecek ve o kararın sahibi kim?* Kimse karar vericiyi adıyla söyleyemiyorsa ortada henüz proje yok demektir — bir araştırma merakı vardır. İkisini farklı fiyatlayın.

## Pilot sözleşmesi

Üretimle temas ettiğinde hayatta kalan bir pilotun, eğitime başlamadan önce yazılı olarak anlaşılmış dört maddesi olur:

- **Sayılı bir başarı metriği.** "Daha iyi churn tahmini" bir metrik değildir. "Geçen çeyreğin holdout setinde en üst dilimde %35'in üzerinde kesinlik" bir metriktir.
- **Geçilecek bir baz çizgi.** Genelde ekibin zaten çalıştırdığı bir sezgisel kural. Model, işletmeye değer bir farkla bu kuralı geçemiyorsa durun.
- **Tarihli veri erişimi.** "Depoyu size açacağız" değil; cuma gününe kadar erişim bilgileri ve adlı bir tablo.
- **Yayınlama yolu.** Kim deploy edecek, kim izleyecek, kime alarm gidecek. Sahibi olmayan model, defterden ibarettir.

## Dürüst takas

Danışmanlık, şirketler arası örüntü eşleştirmede hızlandırır; tek bir yığının derinliğinde köreltir. Panzehir yazmaktır: her iş, müşterinin siz olmadan işletebileceği bir runbook'a sahip olmasıyla biter. İşletemiyorlarsa bağımlılık inşa etmişsinizdir, altyapı değil.
