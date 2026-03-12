package com.knowvera.specification;

import com.knowvera.model.Book;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class BookSpecification {

    public static Specification<Book> searchBooks(
            String q,
            String title,
            String author,
            String category,
            String publisher,
            String availability) {

        return (root, query, cb) -> {
            Join<Object, Object> authorJoin = root.join("authors", JoinType.LEFT);
            Join<Object, Object> categoryJoin = root.join("categories", JoinType.LEFT);
            if (query != null) {
                query.distinct(true);
            }

            Predicate notDeletedPredicate = cb.isFalse(root.get("isDeleted"));
            Predicate combinedFilterPredicate = cb.conjunction();

            if (hasText(q)) {
                String pattern = "%" + q.toLowerCase() + "%";
                Predicate anyField = cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("publisher")), pattern),
                        cb.like(cb.lower(authorJoin.get("fullName")), pattern),
                        cb.like(cb.lower(categoryJoin.get("name")), pattern));
                combinedFilterPredicate = cb.and(combinedFilterPredicate, anyField);
            }

            if (hasText(title)) {
                String titlePattern = "%" + title.toLowerCase() + "%";
                combinedFilterPredicate = cb.and(combinedFilterPredicate,
                        cb.like(cb.lower(root.get("title")), titlePattern));
            }

            if (hasText(publisher)) {
                String publisherPattern = "%" + publisher.toLowerCase() + "%";
                combinedFilterPredicate = cb.and(combinedFilterPredicate,
                        cb.like(cb.lower(root.get("publisher")), publisherPattern));
            }

            if (hasText(author)) {
                String authorPattern = "%" + author.toLowerCase() + "%";
                combinedFilterPredicate = cb.and(combinedFilterPredicate,
                        cb.like(cb.lower(authorJoin.get("fullName")), authorPattern));
            }

            if (hasText(category)) {
                String categoryPattern = "%" + category.toLowerCase() + "%";
                combinedFilterPredicate = cb.and(combinedFilterPredicate,
                        cb.like(cb.lower(categoryJoin.get("name")), categoryPattern));
            }

            if (hasText(availability)) {
                String normalized = availability.trim().toLowerCase();
                if ("available".equals(normalized)) {
                    combinedFilterPredicate = cb.and(combinedFilterPredicate,
                            cb.greaterThan(root.get("availableCopies"), 0));
                } else if ("unavailable".equals(normalized)) {
                    combinedFilterPredicate = cb.and(combinedFilterPredicate,
                            cb.lessThanOrEqualTo(root.get("availableCopies"), 0));
                }
            }

            if (!hasText(q) && !hasText(title) && !hasText(author) && !hasText(category) && !hasText(publisher)
                    && !hasText(availability)) {
                return notDeletedPredicate;
            }

            return cb.and(notDeletedPredicate, combinedFilterPredicate);
        };
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
