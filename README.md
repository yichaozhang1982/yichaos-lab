# Yichao's Lab

A small, static research-notebook website for **Yichao Zhang** (Tongji University), built around the first story:

> **时间有限，合作发生。**  
> *Limitation of Time Promotes Cooperation in Structured Collaboration Systems*  
> IEEE Transactions on Network Science and Engineering, 12(1), 4–12, 2025.

## Pages

- `index.html` — landing page: hero, Story 001 feature, research themes, selected publications, about/contact.
- `story-001.html` — long-form story: the problem, the temporal-game model, an interactive 24-hour allocator, the two original figures, the human experiments, the mechanism, media coverage, and the paper.
- `assets/paper/limitation-of-time.pdf` — author-provided PDF of the paper.
- `assets/img/figure-01.png` — Figure 1, rendered from the supplied original PDF.
- `assets/img/figure-02.png` — Figure 2, rendered from the supplied original PDF.
- `assets/img/figure-04.png` — Figure 4 (human results), extracted from the paper for the evidence section.
- `assets/img/og-cover.png` — social sharing card.
- `docs/preview-home.jpg`, `docs/preview-story.jpg` — screenshots of the finished pages.

## Run locally

No build step or dependencies are required. Either open `index.html` directly, or serve the folder:

```bash
python -m http.server 8765
# http://127.0.0.1:8765/
```

## Design notes

- Editorial layout with a paper, ink, signal-red and lime palette.
- System fonts only (Georgia / Source Han Serif / Segoe UI / Consolas), so the site works offline.
- Responsive at desktop, tablet and phone widths.
- Accessible focus states, keyboard lightbox, reduced-motion support, and a mobile menu with scroll lock.
- The 24-hour allocator is a conceptual demonstration, not a reproduction of the original experiment interface.

## Content and credits

- Paper: Y. Zhang, J. Wang, G. Wen, J. Guan, S. Zhou, G. Chen, K. Chatterjee, M. Perc, “Limitation of Time Promotes Cooperation in Structured Collaboration Systems,” *IEEE Transactions on Network Science and Engineering*, vol. 12, no. 1, pp. 4–12, 2025. DOI: [10.1109/TNSE.2024.3481434](https://doi.org/10.1109/TNSE.2024.3481434).
- Data: [figshare 24171927](https://figshare.com/articles/dataset/Experimental_data_for_limitation_of_time_promotes_cooperation_in_structured_collaboration_systems_/24171927).
- Media coverage: 集智俱乐部, “前沿进展：有限时间资源促进有结构协作系统的合作”, 2024-12-10. [WeChat article](https://mp.weixin.qq.com/s/3OYQ2eCyygYReOuJUQQh7A) · [BAAI mirror](https://hub.baai.ac.cn/view/41706).
- Figures 1, 2 and 4 are reproduced from the paper, © IEEE. They are included here for research communication; please contact the copyright holder for reuse.

## Before publishing

- Replace the relative `og:image` path with an absolute URL once the site has a domain.
- Check that the faculty page, Google Scholar, DOI and figshare links are current.
- The screenshots in `docs/` are documentation previews; they are not loaded by the site.
