const router = require('express').Router();
const Course = require('../models/Course');
const { protect } = require('../middleware/auth');
router.use(protect);
router.get('/', async (req, res, next) => { try { res.json(await Course.find({ $or: [{ createdBy: req.user.id }, { students: req.user.id }] }).sort('code')); } catch(e){next(e);} });
router.post('/', async (req, res, next) => { try { const { code, name, supervisor } = req.body; if (!code || !name) return res.status(400).json({error:'Course code and name are required'}); const course = await Course.create({code,name,supervisor,createdBy:req.user.id,students:[req.user.id]}); res.status(201).json(course); } catch(e){next(e);} });
router.patch('/:id', async (req,res,next)=>{try { const course=await Course.findOneAndUpdate({_id:req.params.id,createdBy:req.user.id},{$set:{name:req.body.name,supervisor:req.body.supervisor}},{new:true,runValidators:true}); if(!course)return res.status(404).json({error:'Course not found'});res.json(course);}catch(e){next(e);}});
router.delete('/:id', async(req,res,next)=>{try{const c=await Course.findOneAndDelete({_id:req.params.id,createdBy:req.user.id});if(!c)return res.status(404).json({error:'Course not found'});res.json({message:'Course deleted'});}catch(e){next(e);}});
module.exports=router;
