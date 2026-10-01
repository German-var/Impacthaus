/* =========================================
   IMPACTHAUS
   SCRIPT
========================================= */


/* =========================================
   MOBILE MENU
========================================= */

const menuBtn =
    document.getElementById("menuBtn");

const navMenu =
    document.getElementById("navMenu");


if (menuBtn && navMenu) {

    menuBtn.addEventListener("click", () => {

        navMenu.classList.toggle("active");

    });


    document
        .querySelectorAll("#navMenu a")
        .forEach(link => {

            link.addEventListener("click", () => {

                navMenu.classList.remove("active");

            });

        });

}



/* =========================================
   SCROLL REVEAL
========================================= */

const revealElements =
    document.querySelectorAll(

        `
        .service-card,
        .benefit,
        .price-card,
        .team-card,
        .process-card,
        .project-card,
        .review-form-card,
        .reviews-wall
        `

    );


revealElements.forEach(element => {

    element.classList.add("reveal");

});


const revealObserver =
    new IntersectionObserver(

        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target
                        .classList
                        .add("visible");


                    revealObserver
                        .unobserve(entry.target);

                }

            });

        },

        {
            threshold: 0.10
        }

    );


revealElements.forEach(element => {

    revealObserver.observe(element);

});



/* =========================================
   SUPABASE
========================================= */

const SUPABASE_URL =
    "https://caxpsvraudgivyvbewuc.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_fDzVqKPbjXIDBeRir4BFlw_Cvh2thKe";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );



/* =========================================
   REVIEWS
========================================= */

const reviewForm =
    document.getElementById("reviewForm");

const ratingButtons =
    document.querySelectorAll(
        "#ratingStars button"
    );

const reviewName =
    document.getElementById("reviewName");

const reviewBusiness =
    document.getElementById("reviewBusiness");

const reviewMessage =
    document.getElementById("reviewMessage");

const reviewStatus =
    document.getElementById("reviewStatus");

const reviewsContainer =
    document.getElementById("reviewsContainer");

const reviewCount =
    document.getElementById("reviewCount");


let selectedRating = 0;



/* =========================================
   RATING STARS
========================================= */

ratingButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            selectedRating =
                Number(
                    button.dataset.rating
                );

            updateStars();

        }
    );

});


function updateStars() {

    ratingButtons.forEach(button => {

        const value =
            Number(
                button.dataset.rating
            );

        if (value <= selectedRating) {

            button.classList.add(
                "active"
            );

        } else {

            button.classList.remove(
                "active"
            );

        }

    });

}



/* =========================================
   SUBMIT REVIEW
========================================= */

if (reviewForm) {

    reviewForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const name =
                reviewName.value.trim();

            const business =
                reviewBusiness.value.trim();

            const message =
                reviewMessage.value.trim();


            if (!name) {

                showStatus(
                    "Escribe tu nombre."
                );

                return;

            }


            if (selectedRating === 0) {

                showStatus(
                    "Selecciona una calificación."
                );

                return;

            }


            if (!message) {

                showStatus(
                    "Cuéntanos un poquito de tu experiencia."
                );

                return;

            }


            showStatus(
                "Publicando reseña..."
            );


            const { error } =
                await supabaseClient
                    .from("Reviews Impacthauss")
                    .insert([
                        {
                            name: name,
                            business:
                                business || null,
                            rating:
                                selectedRating,
                            message:
                                message
                        }
                    ]);


            if (error) {

                console.error(
                    "Error al guardar reseña:",
                    error
                );

                showStatus(
                    "No se pudo publicar la reseña."
                );

                return;

            }


            reviewForm.reset();

            selectedRating = 0;

            updateStars();


            showStatus(
                "Gracias por compartir tu experiencia ✦"
            );


            await loadReviews();

        }
    );

}



/* =========================================
   LOAD REVIEWS
========================================= */

async function loadReviews() {

    if (
        !reviewsContainer ||
        !reviewCount
    ) {

        return;

    }


    const { data, error } =
        await supabaseClient

            .from("Reviews Impacthauss")

            .select("*")

            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Error al cargar reseñas:",
            error
        );


        reviewsContainer.innerHTML = `

            <div class="reviews-empty">

                <div>
                    !
                </div>

                <h4>
                    No pudimos cargar las reseñas.
                </h4>

                <p>
                    Intenta nuevamente en unos momentos.
                </p>

            </div>

        `;


        return;

    }


    renderReviews(
        data || []
    );

}



/* =========================================
   RENDER REVIEWS
========================================= */

function renderReviews(reviews) {

    if (
        !reviewsContainer ||
        !reviewCount
    ) {

        return;

    }


    reviewCount.textContent =
        reviews.length;


    if (reviews.length === 0) {

        reviewsContainer.innerHTML = `

            <div class="reviews-empty">

                <div>
                    ✦
                </div>

                <h4>
                    Aún no hay reseñas.
                </h4>

                <p>
                    Puedes ser de los primeros
                    en dejarnos una :)
                </p>

            </div>

        `;


        return;

    }


    reviewsContainer.innerHTML = "";


    reviews.forEach(review => {


        const article =
            document.createElement(
                "article"
            );


        article.className =
            "review-item";


        const stars =

            "★".repeat(
                review.rating
            )

            +

            "☆".repeat(
                5 - review.rating
            );


        article.innerHTML = `

            <div class="review-item-header">

                <div class="review-client">

                    <strong>
                        ${escapeHTML(review.name)}
                    </strong>

                    ${
                        review.business

                        ?

                        `
                        <span>
                            ${escapeHTML(
                                review.business
                            )}
                        </span>
                        `

                        :

                        ""
                    }

                </div>


                <div class="review-stars-display">
                    ${stars}
                </div>

            </div>


            <p>
                ${escapeHTML(
                    review.message
                )}
            </p>

        `;


        reviewsContainer
            .appendChild(
                article
            );

    });

}



/* =========================================
   STATUS
========================================= */

function showStatus(message) {

    if (!reviewStatus) {

        return;

    }


    reviewStatus.textContent =
        message;


    setTimeout(() => {

        reviewStatus.textContent =
            "";

    }, 4000);

}



/* =========================================
   ESCAPE USER INPUT
========================================= */

function escapeHTML(text) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        text ?? "";


    return element.innerHTML;

}



/* =========================================
   INITIAL LOAD
========================================= */

loadReviews();
