/**
 * Page gutter for `/reviews`. Every horizontal edge on the page derives from
 * it — hero headline, stats card and the featured row all start on the same
 * line — so it lives in its own module rather than in either component.
 *
 * The design's proportions are held in `vw` rather than fixed px so the page
 * scales as one: the mock measures a 5.8% gutter, a 42.8% hero height and so
 * on. The clamp bounds only stop those from collapsing on phones or running
 * away on very wide screens.
 */
export const REVIEWS_GUTTER = "px-[clamp(16px,5.8vw,84px)]";
