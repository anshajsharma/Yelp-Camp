var express=require("express"),
    router=express.Router({mergeParams: true}),
    Campground=require("../models/campground");



// INDEX - show all campgrounds
router.get("/",function(req,res){

    // console.log(req.user)   // returns current user name and id if logged in else returns null

    // Get all campgrounds from DB
    Campground.find({},function(err,allCampgrounds){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/index",{campgrounds:allCampgrounds, currentUser: req.user});
        }
    });
});

// CREATE - add new campground to DB
router.post("/", isLoggedIn, function(req,res){
    // res.send("Post Route");
    var name = req.body.name;
    var image = req.body.image;
    var desc=req.body.description;
    // req.user gives all information about current loggedin user
    var author={
        id:req.user._id,
        username:req.user.username
    }
    var newCampground={name:name, image:image, description:desc, author:author};
    
    // Create a new campground and save to DB
    Campground.create(newCampground,function(err,newCampground){
        if(err){
            console.log(err);

        }else{
            // redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});

// NEW - form to create new campground  
router.get("/new", isLoggedIn, function(req,res){
    res.render("campgrounds/new");
});

// SHOW - shows more info about campground
router.get("/:id",function(req,res){
    //  find the campground with provided id
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
        if(err) console.log(err);
        else{
            // console.log(foundCampground);
            res.render("campgrounds/show", {campground:foundCampground});
        }
    });
    //  render show template with that campground
});


// EDIT ROUTE
router.get("/:id/edit", checkCampgroundOwnership, function(req,res){
    Campground.findById(req.params.id,function(err,foundCampground){
           res.render("campgrounds/edit",{campground:foundCampground});
    })
})

// UPDATE ROUTE
router.put("/:id", checkCampgroundOwnership, function(req,res){
    // find and update the campground
    var data=req.body.campground;
    Campground.findByIdAndUpdate(req.params.id,data,function(err,updatedCampground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }else{
            res.redirect("/campgrounds/"+req.params.id);
        }
    })
});


// DESTROY ROUTE
router.delete("/:id", checkCampgroundOwnership, function(req,res){
    // res.send("Deleting");
    Campground.findByIdAndRemove(req.params.id,function(err,body){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }else{
            res.redirect("/campgrounds");
        }
    })
})


// middleware
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect("/login");
    }
}

function checkCampgroundOwnership(req,res,next){
    if(req.isAuthenticated()){
        Campground.findById(req.params.id,function(err,foundCampground){
            if(err){
                res.redirect("back");
            }else{
                if(foundCampground.author.id.equals(req.user._id)){     // using .equals because first variable is an
                                                                        // object while other is string so == or ===
                                                                        // will not work
                    next();
                }else{
                    res.redirect("back");
                }
            }
        })
    }else{
        res.redirect("back");
    }
}

module.exports=router;