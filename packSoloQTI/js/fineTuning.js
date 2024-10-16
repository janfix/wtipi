$(document).ready(function () {

    let reviewModeHandlerAttached = true;

    // Function to attach click handler
    function attachClickHandlers() {
        $('.qtijs-input-wrap>label').on('click', function () {
            console.log("IN");
            // Remove 'selected' class from all input wraps
            $('.qtijs-input-wrap').removeClass('selected');
            // Add 'selected' class to the clicked input wrap
            $(this).parent().addClass('selected');
            // Check the radio button within the clicked input wrap
           




        });



        //Fixing review Mode
        $(".qtijs-prev").on("click", function (e) {
            console.log($("#myform input[type='radio']:checked").val())
            $('input:checked').parent().parent().addClass("selectedButProtected")

            // Attach click handler to .qtijs-review-mode if not already attached
            if (!reviewModeHandlerAttached) {
                $(document).on("click", ".qtijs-review-mode", function (e) {
                    alert("You can't modify your answer anymore...");
                });
                reviewModeHandlerAttached = true;
            }
        });
    }

    // Create an observer instance linked to the callback function
    var observer = new MutationObserver(function (mutationsList, observer) {
        for (var mutation of mutationsList) {
            if (mutation.type === 'childList') {
                // Attach click handlers to new elements
                attachClickHandlers();
            }
        }
    });

    // Start observing the target node for configured mutations
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial attachment
    attachClickHandlers();



});
