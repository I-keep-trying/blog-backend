const Blog = require('../models/blog')
const User = require('../models/user')

const initialBloglist = [
  {
    title: 'HTML is easy',
    author: 'groot',
    url: 'google.com',
    likes: 0,
  },
  {
    title: 'Browser can execute only Javascript',
    author: 'Jessie',
    url: 'google.com',
    likes: 0,
  },
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon' })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const BloglistInDb = async () => {
  const bloglist = await Blog.find({})
  return bloglist.map((blog) => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map((u) => u.toJSON())
}

module.exports = {
  initialBloglist,
  nonExistingId,
  BloglistInDb,
  usersInDb,
}
