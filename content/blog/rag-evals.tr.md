+++
title = "Histen öteye: RAG pipeline'larını değerlendirmek"
description = "Retrieval-augmented generation için pratik bir değerlendirme altyapısı: altın veri setleri, sadakat kontrolleri ve CI'da regresyon kapıları."
date = 2026-08-20
updated = 2026-08-24

[taxonomies]
tags = ["LLM", "RAG", "Değerlendirme"]

[extra]
kind = "post"
+++

## Giriş

Her RAG demosu, gerçek kullanıcı sorularıyla karşılaşana kadar etkileyici görünür. Demo ile sistem arasındaki fark ölçümdür: dünkü değişikliğin getirmeyi iyileştirip iyileştirmediğini söyleyen, tekrarlanabilir bir değerlendirme altyapısı.

## Savunabileceğiniz bir altın veri seti

Küçük ve insani başlayın. Destek taleplerinden, satış görüşmelerinden ya da kendi kullanımınızdan 50 ila 100 gerçek soru toplayın. Her biri için beklenen cevabı ve daha önemlisi *mutlaka* kaynak gösterilmesi gereken belgeleri kaydedin. Dağılımı yansıttığı için 80 örnekli bir altın set, sentetik 10.000 örnekten her zaman iyidir.

## Çoğu regresyonu yakalayan üç kontrol

Her aday değişikliği — yeni parçalama, yeni embedding modeli, yeni reranker — aynı üç kapıdan geçirin:

1. **Recall@k**: gerekli kaynak belge, getirilen ilk k parça içinde mi?
2. **Sadakat**: üretilen cevap, getirilen bağlama bağlı kalıyor mu? İkinci bir modelle entailment kontrolü pratik bir yaklaşımdır.{% sidenote(id="entailment") %}MNLI üzerinde ince ayarlı bir NLI modeli kullanıyor ve 0,7'nin üzerindeki çelişki olasılığını hata sayıyorum.{% end %}
3. **Ret kalitesi**: derlem dışındaki sorularda sistem uydurmak yerine bilmediğini söylüyor mu?

```python
results = harness.run(candidate, golden_set)
assert results.recall_at_5 >= baseline.recall_at_5 - 0.02
assert results.faithfulness >= 0.90
assert results.false_answer_rate <= 0.05
```

## CI'da kapı koyun

Değerlendirme, merge'leri engellemiyorsa bir anlamı yok. Değerlendirmeyi hızlı tutun — her pull request'te örneklenmiş bir alt küme, geceleri tam set — ve altın veri setini kodla birlikte versiyonlayın. Bir regresyon gözden kaçtığında, başarısız soruyu sete ekleyin. Veri seti, spesifikasyonun ta kendisidir.
