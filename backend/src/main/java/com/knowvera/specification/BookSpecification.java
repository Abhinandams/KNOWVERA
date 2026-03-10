package com.knowvera.specification;

import com.knowvera.model.Book;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

public class BookSpecification {

    public static Specification<Book> searchByTitleOrAuthorOrCategory(String title, String author, String category) {

        return (root, query, cb) -> {
            Join<Object, Object> authorJoin = root.join("authors", JoinType.LEFT);
            Join<Object, Object> categoryJoin = root.join("categories", JoinType.LEFT);

            Predicate notDeletedPredicate = cb.isFalse(root.get("isDeleted"));
            Predicate combinedFilterPredicate = cb.conjunction();

            if (hasText(title)) {
                String titlePattern = "%" + title.toLowerCase() + "%";
                combinedFilterPredicate = cb.and(combinedFilterPredicate,
                        cb.like(cb.lower(root.get("title")), titlePattern));
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

            if (!hasText(title) && !hasText(author) && !hasText(category)) {
                return notDeletedPredicate;
            }

            return cb.and(notDeletedPredicate, combinedFilterPredicate);
        };
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
