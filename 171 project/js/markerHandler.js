var orderNumber = null;

AFRAME.registerComponent("markerhandler", {
  init: async function() {

    if (tableNumber === null) {
      this.askOrderNumber();
    }

    var toys = await this.getToys();

    this.el.addEventListener("markerFound", () => {
      var markerId = this.el.id;
      this.handleMarkerFound(toys, markerId);
    });

    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },

  askOrderNumber: function() {
    //to be changed - the url
    var iconUrl = "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
    swal(
      {
        title:"welcome to toy garden",
        icon:iconUrl,
        content:{
          element:"input",
          attributes:{
            placeholder:"Type your order number",
            type:"number",
            min:1
          }
        },
        closeOnClickOutside:false


      

      }
    )
    .then((inputValue)=>{
      orderNumber=inputValue
    })
    
    
  },

  handleMarkerFound: function(toys, markerId) {
    // Getting today's day
    var todaysDate = new Date();
    var todaysDay = todaysDate.getDay();
    
    // Sunday - Saturday : 0 - 6
    var days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ];

    var toy = toys.filter(toy => toy.id === markerId)[0];

    if (toy.unavailable_days.includes(days[todaysDay])) {
      swal({
        icon: "warning",
        title: toy.toy_name.toUpperCase(),
        text: "The toy isn't available today!",
        timer: 2500,
        buttons: false
      });
    } else {
       // Changing Model scale to initial scale
      var model = document.querySelector(`#model-${toy.id}`);
      model.setAttribute("position", toy.model_geometry.position);
      model.setAttribute("rotation", toy.model_geometry.rotation);
      model.setAttribute("scale", toy.model_geometry.scale);
      model.setAttribute("visible",true)
      var infoContainer = document.querySelector(`#main-plane-${toy.id}`)
      infoContainer.setAttribute("visible",true)
      var pricePlane = document.querySelector(`#price-plane-${toy.id}`)
      pricePlane.setAttribute("visible",true)
      
      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";

      var ratingButton = document.getElementById("rating-button");
      var orderButton = document.getElementById("order-button");

      // Handling Click Events
      ratingButton.addEventListener("click", function() {
        swal({
          icon: "warning",
          title: "Rate Toy",
          text: "Work In Progress"
        });
      });

      orderButton.addEventListener("click", () => {
        var oNumber 
        orderNumber<=9?(oNumber=`T0${orderNumber}`):(oNumber=`T${orderNumber}`)
        this.handleOrder(oNumber,toy)
        swal({
          icon: "https://i.imgur.com/4NZ6uLY.jpg",
          title: "Thanks For the Order !",
          text: "Your order will delivered soon!",
          timer: 2000,
          buttons: false
        });
      });
    }
  },
  handleOrder: function(oNumber, toy) {
    firebase
      .firestore()
      .collection("orders")
      .doc(oNumber)
      .get()
      .then(doc=>{
        var details = doc.data()
        if (details["current_orders"][toy.id]) {
          // Increasing Current Quantity
          details["current_orders"][toy.id]["quantity"] += 1;

          //Calculating Subtotal of item
          var currentQuantity = details["current_orders"][toy.id]["quantity"];

          details["current_orders"][toy.id]["subtotal"] =
            currentQuantity * toy.price;
        } else {
          details["current_orders"][toy.id] = {
            item: toy.toy_name,
            price: toy.price,
            quantity: 1,
            subtotal: toy.price * 1
          };
        }
        details.total_bill+=toy.price
        firebase 
        .firestore()
        .collection("orders")
        .doc(doc.id)
        .update(details)
      }
        )
  },

  getToys: async function() {
    return await firebase
      .firestore()
      .collection("toys")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  handleMarkerLost: function() {
    // Changing button div visibility
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  }
});
