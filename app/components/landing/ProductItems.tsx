import React from "react";

const posts = [
  {
    image: "images/post-item1.jpg",
    category: "Books",
    title: "10 Must-Read Books of the Year: Our Top Picks!",
    description:
      "Dive into the world of cutting-edge technology with our latest blog post, where we highlight five essential gadge.",
    link: "index.html",
  },
  {
    image: "images/post-item2.jpg",
    category: "Books",
    title: "The Fascinating Realm of Science Fiction",
    description:
      "Explore the intersection of technology and sustainability in our latest blog post. Learn about the innovative",
    link: "index.html",
  },
  {
    image: "images/post-item3.jpg",
    category: "Books",
    title: "Finding Love in the Pages of a Book",
    description:
      "Stay ahead of the curve with our insightful look into the rapidly evolving landscape of wearable technology.",
    link: "index.html",
  },
  {
    image: "images/post-item4.jpg",
    category: "Books",
    title: "Reading for Mental Health: How Books Can Heal and Inspire",
    description:
      "In today's remote work environment, productivity is key. Discover the top apps and tools that can help you stay",
    link: "index.html",
  },
];

const ProductItems = () => {
  return (
    <section id="latest-posts">
      <div className="container">
        <div className="section-title d-md-flex justify-content-between align-items-center mb-4">
          <h3 className="d-flex align-items-center">Latest products</h3>
          <a href="index.html" className="btn">
            View All
          </a>
        </div>
        <div className="row">
          {posts.map((post, index) => (
            <div className="col-md-3 posts mb-4" key={index}>
              <img
                src={post.image}
                alt="post image"
                className="img-fluid rounded-3"
              />
              {/* <a href="blog.html" className="fs-6 text-primary">
                {post.category}
              </a> */}
              <h4 className="card-title mb-2 text-capitalize text-dark">
                {post.title}
              </h4>
              <p className="mb-2">
                {post.description}
                <span>
                  <a
                    className="text-decoration-underline text-black-50"
                    href={post.link}
                  >
                    Read More
                  </a>
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductItems;
