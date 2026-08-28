import categories from "../data/categories";

function Categories() {
  return (
    <section className="categories-section" id="categories">

      <div className="section-title">
        <span>EXPLORE KAAMON</span>
        <h2>Find What You Need</h2>
        <p>
          Explore popular local work categories around you.
        </p>
      </div>

      <div className="categories-grid">
        {categories.map((category) => (
          <div className="category-box" key={category.id}>

            <div className="category-emoji">
              {category.icon}
            </div>

            <h3>{category.name}</h3>

            <p>{category.description}</p>

          </div>
        ))}
      </div>

    </section>
  );
}

export default Categories;