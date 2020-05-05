const bloglistRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

bloglistRouter.get('/', async (req, res) => {
  const bloglist = await Blog.find({}).populate('user', {
    username: 1,
    name: 1,
  })
  console.log('Blog.find.populate', bloglist)
  res.json(bloglist.map((blog) => blog.toJSON()))
})

bloglistRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog.toJSON())
  } else {
    response.status(404).end()
  }
})

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

bloglistRouter.post('/', async (request, response) => {
  const body = request.body
  const token = getTokenFrom(request)
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)

  if (body.title === undefined) {
    return response.status(400).json({ error: 'title missing' })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id,
  })
  console.log('blog.user', blog.user)
  const savedBlog = await blog.save()
  user.bloglist = user.bloglist.concat(savedBlog._id)
  await user.save()

  response.json(savedBlog.toJSON())
})

bloglistRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

bloglistRouter.put('/:id', (request, response, next) => {
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
  }

  Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    .then((updatedBlog) => {
      console.log(request.params)
      response.json(updatedBlog.toJSON())
    })
    .catch((error) => next(error))
})

module.exports = bloglistRouter
