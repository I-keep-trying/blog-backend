const config = require('../utils/config')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const api = supertest(app)
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')

console.log('NODE_ENV: ', process.env.NODE_ENV, 'URI: ', config.MONGODB_URI)

/* beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBloglist.map((blog) => new Blog(blog))
  const promiseArray = blogObjects.map((blog) => blog.save())
  await Promise.all(promiseArray)
})

test('bloglist are returned as json', async () => {
  console.log('entered test')
  await api
    .get('/api/bloglist')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all bloglist are returned', async () => {
  const response = await api.get('/api/bloglist')

  expect(response.body).toHaveLength(helper.initialBloglist.length)
})

test('a specific blog is within the returned bloglist', async () => {
  const response = await api.get('/api/bloglist')

  const contents = response.body.map((r) => r.content)

  expect(contents).toContain('Browser can execute only Javascript')
})

test('a valid blog can be added', async () => {
  const newBlog = {
    content: 'async/await simplifies making async calls',
    important: true,
  }

  await api
    .post('/api/bloglist')
    .send(newBlog)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const bloglistAtEnd = await helper.bloglistInDb()
  expect(bloglistAtEnd).toHaveLength(helper.initialBloglist.length + 1)

  const contents = bloglistAtEnd.map((n) => n.content)

  expect(contents).toContain('async/await simplifies making async calls')
})

test('blog without content is not added', async () => {
  const newBlog = {
    important: true,
  }

  await api.post('/api/bloglist').send(newBlog).expect(400)

  const bloglistAtEnd = await helper.bloglistInDb()

  expect(bloglistAtEnd).toHaveLength(helper.initialBloglist.length)
})

test('a specific blog can be viewed', async () => {
  const bloglistAtStart = await helper.bloglistInDb()

  const blogToView = bloglistAtStart[0]

  const resultBlog = await api
    .get(`/api/bloglist/${blogToView.id}`)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(resultBlog.body).toEqual(blogToView)
})

test('a blog can be deleted', async () => {
  const bloglistAtStart = await helper.bloglistInDb()
  const blogToDelete = bloglistAtStart[0]

  await api.delete(`/api/bloglist/${blogToDelete.id}`).expect(204)

  const bloglistAtEnd = await helper.bloglistInDb()

  expect(bloglistAtEnd).toHaveLength(helper.initialBloglist.length - 1)

  const contents = bloglistAtEnd.map((r) => r.content)

  expect(contents).not.toContain(blogToDelete.content)
}) */

// user api tests

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    console.log('before Each...')
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map((u) => u.username)
    expect(usernames).toContain(newUser.username)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
