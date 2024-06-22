async function retrieveInformation () {
  const navList = document.querySelector('.nav__links')
  const retrieveQueryDiv = document.getElementById('retrieveQuery')

  if (navList) {
    const clickedLink = event.currentTarget.querySelector('a')

    if (clickedLink.textContent === 'Users') {
      const response = await fetch(
        'http://localhost:5001/admin/retrieveUsersAdmin',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()

        // CREATE TABLE ROWS FOR EACH USER
        const rows = data.usersCollection
          .map(
            (user) => `
            <tr>
                <td>${user._id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td class="password-cell">${user.password}</td>
                <td>${user.role}</td>
                <td class="button__wrapper">
                    <button type="button" class="edit__button">Edit</button>
                    <button type="button" class="delete__button">Delete</button>
                </td>
            </tr>
            `
          )
          .join('')

        retrieveQueryDiv.innerHTML = `
            <h1>Users Dashboard</h1>
            <form id="admin-form">
              <table class="table user__table">
                <thead>
                  <tr>
                    <th scope="col">User ID</th>
                    <th scope="col">Username</th>
                    <th scope="col">Email</th>
                    <th scope="col">Password</th>
                    <th scope="col">Role</th>
                    <th scope="col">Action</th>
                  </tr>
                  <tr>
                    <td>Default Generated</td>
                    <td><input type="text" id="username__admin-create" /><p id="error-username"></p></td>
                    <td><input type="email" id="email__admin-create" /><p id="error-email"></p></td>
                    <td><input type="password" id="password__admin-create" /><p id="error-password"></p></td>
                    <td><input type="text" id="role__admin-create" /><p id="error-role"></p></td>
                    <td><button type="submit" class="add__user-btn">Add User</button></td>
                  </tr>
                </thead>
                <tbody id="retrieveQueryTable">
                ${rows}
                </tbody>
              </table>
            </form>
            `
      }
    } else if (clickedLink.textContent === 'Rules') {
      retrieveQueryDiv.innerHTML = `
      <h1>Rules and Guidelines</h1>
          <div class="rules__guidelines container">
            <ul>
              <li>
                <h4>Access Control and Permissions</h4>
                <div class="rules__description">
                  <div>
                    <i class="bx bx-check"></i>
                    <p>
                      Admins will be granted access based on their roles and
                      responsibilities.
                    </p>
                  </div>
                  <div>
                    <i class="bx bx-check"></i>
                    <p>
                      Permissions will be reviewed regularly to ensure they
                      align with job functions.
                    </p>
                  </div>
                </div>
              </li>
              <li>
                <h4>Security Best Practices</h4>
                <div class="rules__description">
                  <div>
                    <i class="bx bx-check"></i>
                    <p>
                      Admins must follow security best practices, including
                      strong password usage and enabling two-factor
                      authentication.
                    </p>
                  </div>
                  <div>
                    <i class="bx bx-check"></i>
                    <p>
                      Regularly update and patch the system to address security
                      vulnerabilities.
                    </p>
                  </div>
                </div>
              </li>
              <li>
                <h4>Data Privacy</h4>
                <div class="rules__description">
                  <div>
                    <i class="bx bx-check"></i>
                    <p>Admins are expected to respect user privacy.</p>
                  </div>
                  <div>
                    <i class="bx bx-check"></i>
                    <p>
                      Sensitive user information should only be accessed when
                      necessary for authorized tasks.
                    </p>
                  </div>
                </div>
              </li>
              <li>
                <h4>Training and Documentation</h4>
                <div class="rules__description">
                  <div>
                    <i class="bx bx-check"></i>
                    <p>
                      Admins are required to undergo comprehensive training on
                      system features and best practices.
                    </p>
                  </div>
                  <div>
                    <i class="bx bx-check"></i>
                    <p>
                      Keep documentation up-to-date and accessible for admin
                      procedures and workflows.
                    </p>
                  </div>
                </div>
              </li>
              <li>
                <h4>Audit Trail</h4>
                <div class="rules__description">
                  <div>
                    <i class="bx bx-check"></i>
                    <p>
                      All admin actions will be logged for auditing purposes.
                    </p>
                  </div>
                  <div>
                    <i class="bx bx-check"></i>
                    <p>
                      Admins must regularly review audit logs for any unusual or
                      suspicious activities.
                    </p>
                  </div>
                </div>
              </li>
              <li>
                <h4>Incident Response</h4>
                <div class="rules__description">
                  <div>
                    <i class="bx bx-check"></i>
                    <p>
                      Admins must be familiar with the incident response plan
                      and report security incidents promptly.
                    </p>
                  </div>
                  <div>
                    <i class="bx bx-check"></i>
                    <p>
                      Regularly test and update the incident response plan to
                      ensure effectiveness.
                    </p>
                  </div>
                </div>
              </li>
            </ul>
            <!-- ADMINS CANT DO -->
            <ul class="rules__cant-do">
              <li>
                <h4>Unauthorized Access</h4>
                <div class="rules__description">
                  <div>
                    <i class="bx bx-x"></i>
                    <p>
                      Admins must not access user accounts, data, or features
                      beyond their designated responsibilities without proper
                      authorization.
                    </p>
                  </div>
                </div>
              </li>
              <li>
                <h4>Misuse of Privileges</h4>
                <div class="rules__description">
                  <div>
                    <i class="bx bx-x"></i>
                    <p>
                      Admins must not use their privileges to access or modify
                      data for personal gain.
                    </p>
                  </div>
                </div>
              </li>
              <li>
                <h4>Unauthorized Changes</h4>
                <div class="rules__description">
                  <div>
                    <i class="bx bx-x"></i>
                    <p>
                      Admins must not make unauthorized changes to the system
                      configuration or settings.
                    </p>
                  </div>
                </div>
              </li>
              <li>
                <h4>Bypassing Security Measures</h4>
                <div class="rules__description">
                  <div>
                    <i class="bx bx-x"></i>
                    <p>
                      Admins should not attempt to bypass security measures or
                      disable security features unless required for system
                      maintenance.
                    </p>
                  </div>
                </div>
              </li>
              <li>
                <h4>Sharing Credentials</h4>
                <div class="rules__description">
                  <div>
                    <i class="bx bx-x"></i>
                    <p>
                      Admins must not share their login credentials or any
                      access information with unauthorized individuals.
                    </p>
                  </div>
                </div>
              </li>
              <li>
                <h4>Unauthorized System Modifications</h4>
                <div class="rules__description">
                  <div>
                    <i class="bx bx-x"></i>
                    <p>
                      Admins should not make unauthorized changes to the system
                      configuration or code without proper approval and
                      following change control procedures.
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          `
    } else if (clickedLink.textContent === 'Chat History') {
      const response = await fetch(
        'http://localhost:5001/admin/retrieveChatHistoryAdmin',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        const data = await response.json()

        retrieveQueryDiv.innerHTML = `
          <h1>Chat History Dashboard</h1>
          <table class="table">
            <thead>
              <tr>
                <th scope="col">Username</th>
                <th scope="col">Title</th>
                <th scope="col">Prompts</th>
                <th scope="col">Responses</th>
                <th scope="col">Timestamps</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody id="tableBody">
            </tbody>
          </table>
            `

        const tableBody = document.getElementById('tableBody')
        if (Array.isArray(data.chatHistory)) {
          for (const item of data.chatHistory) {
            const row = `
              <tr>
                <td>${item.username}</td>
                <td class="elipsis">${item.title}</td>
                <td class="elipsis">${item.prompts}</td>
                <td class="elipsis">${item.responses}</td>
                <td>${item.timestamp}</td>
                <td class="button__wrapper delete__wrapper">
                  <button type="button" class="delete__button-history">Delete
                  </button>
                </td>
              </tr>
            `
            tableBody.innerHTML += row
          }
        }
      } else {
        // HANDLE ERRORS
        console.error('Error fetching chat history:', response.statusText)
      }
    }
  }
}

export { retrieveInformation }
export const listItems = document.querySelectorAll('.nav__link')
