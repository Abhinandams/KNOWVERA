const CATEGORY_COVERS: Array<{ match: string[]; url: string }> = [
  { match: ["science", "physics", "chemistry", "biology"], url: "https://i.pinimg.com/736x/5a/f9/0d/5af90dc82af9aebf469ce345a4646dd0.jpg" },
  { match: ["fiction", "fantasy", "novel", "dystopian"], url: "https://i.pinimg.com/736x/47/e5/74/47e574a8de7e2e4c9f85e92a47d9c0e4.jpg" },
  { match: ["history", "art", "culture"], url: "https://i.pinimg.com/736x/3c/ca/ef/3ccaef8ceacfc949698db66353cf755c.jpg" },
  { match: ["technology", "computer", "programming"], url: "https://i.pinimg.com/1200x/9f/0a/ba/9f0ababbc2673d8c20bb06755ae03d43.jpg" },
  { match: ["reference", "encyclopedia", "dictionary"], url: "https://i.pinimg.com/736x/6b/f2/e2/6bf2e2a9ff3c4e0febf8e2e0cdc9106e.jpg" },
  { match: ["drama", "poetry", "literature"], url: "https://i.pinimg.com/736x/12/f5/a4/12f5a45c89080af6c8db5e4a8b657f90.jpg" },
  { match: ["philosophy"], url: "https://i.pinimg.com/736x/48/10/d6/4810d6edb807fcf9be9fd1a5c5725e81.jpg" },
  { match: ["body"], url: "https://i.pinimg.com/736x/e6/5a/8f/e65a8fab840ee0305de438053e8f356f.jpg" },

];

const DEFAULT_COVER = "https://i.pinimg.com/1200x/d4/25/7f/d4257f77ee2268988c2381139bb4eb4f.jpg";

export const getCategoryCover = (category?: string) => {
  const normalized = String(category ?? "").toLowerCase();
  const found = CATEGORY_COVERS.find(({ match }) =>
    match.some((keyword) => normalized.includes(keyword))
  );
  return found?.url ?? DEFAULT_COVER;
};
