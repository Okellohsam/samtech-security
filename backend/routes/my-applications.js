router.get("/my", auth, async(req,res)=>{

const apps = await Application.find({expert:req.user.id})
.populate("job","title")

res.json(apps)

})